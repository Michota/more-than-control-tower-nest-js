# ADR-001: Cross-Module Communication via CQRS Bus and Domain Events

**Status:** Accepted
**Date:** 2026-03-16
**Context:** DSC Distribution Management Platform - Modular Monolith, NestJS, MikroORM, PostgreSQL

---

## Context

The system is a multi-tenant B2B platform where each module (Warehouse, Sales, CRM, Freight, Accountancy, Delivery) must be independently swappable — a tenant may replace any internal module with an external system (e.g. Fakturownia for invoicing, external WMS for warehouse). This requires that modules have zero knowledge of each other's internals.

We needed to decide how modules communicate for three distinct scenarios: reacting to state changes, reading data from another module, and triggering actions in another module.

Several approaches were evaluated: direct facade imports, shared ORM entities across modules, event-driven local projections (read model copies), and bus-based communication.

## Decision

### 1. Cross-module reads use Query Bus

When a module needs data owned by another module, it dispatches a Query object through the NestJS `QueryBus` (`@nestjs/cqrs`). The owning module registers a `QueryHandler`. The requesting module knows only the Query class and the response interface — both defined in `src/shared/queries/`.

Rejected alternatives:

- **Direct facade import** — creates a compile-time dependency on the providing module. If the module is removed (tenant uses external system), the import breaks. Query Bus decouples sender from receiver.
- **Shared ORM entity import in infrastructure** — even importing an ORM entity from another module's infrastructure layer creates a dependency that breaks when the module is swapped out.
- **Event-driven local projection** — duplicates data, introduces eventual consistency. For a B2B system with physical goods, selling stock that doesn't exist is unacceptable. Rejected as the default approach; may be adopted later for specific high-throughput read scenarios.

### 2. Cross-module reactions use Domain Events

When a module completes a significant state change, it publishes a Domain Event to the in-process event bus (`@nestjs/event-emitter`). Other modules subscribe and react independently. The **publishing module does not know who listens**.

Domain Event classes are the sole permitted direct import between modules — they are small, immutable data objects serving as a public contract.

### 3. Cross-module writes use Command Bus

When a module needs to trigger a state change in another module, it dispatches a Command through the NestJS `CommandBus`. The target module validates and executes.

### 4. No cross-module database coupling

- No physical foreign keys between tables of different modules.
- No cross-module SQL joins or shared ORM entities.
- Inter-module references use plain string/UUID columns (logical references only).
- Table names are prefixed with module name (e.g. `warehouse_product_stocks`, `sales_products`).

### 5. Single global migration pipeline

MikroORM manages all ORM entities and migrations globally — one config, one migrations folder, one execution order. Module separation is enforced at the code level (directories, ports, adapters), not at the database level.

### 6. Query/Command/Event contracts live in Shared Kernel

`src/shared/queries/`, `src/shared/commands/`, and base event types form the inter-module contract layer. These contain flat data types only — no business logic, no services, no database access.

## Consequences

### Positive
- Any module can be swapped for an external system by registering a different QueryHandler/CommandHandler for the same Query/Command — **zero changes in consuming modules**.
- Modules are testable in isolation by mocking the bus.
- No N+1 risk if Query interfaces are designed to accept arrays of IDs from the start.
- Strong consistency for reads — QueryBus in a monolith is a direct in-process call, no eventual consistency gap.
- Single deployment, single transaction scope — atomic operations across aggregates remain straightforward.

### Negative
- Temporal coupling on reads — if a module's QueryHandler fails, the requesting module cannot get the data. Acceptable in a monolith (same process), would require mitigation in a distributed system.
- Shared Kernel becomes a coordination point — changes to Query/Response interfaces require alignment between the publishing and consuming module. Mitigated by treating these as versioned API contracts.
- QueryBus adds a layer of indirection compared to a direct function call. Debugging requires knowing which handler is registered for a given Query. Mitigated by NestJS CQRS module's explicit `@QueryHandler` decorator.
- Event-based workflows can be hard to trace across modules. For complex multi-step processes, an orchestrator/saga may be needed instead of chained events.

### Future migration path
If modules are ever extracted into separate services, the QueryBus dispatch can be replaced with an HTTP/gRPC call behind the same Query interface. The EventBus can be replaced with RabbitMQ/Kafka. The bus abstraction makes this a transport-layer change, not a domain-layer rewrite.


# ADR-002: Mikro ORM entity definition uses `defineEntity` (schema-first, no decorators)

MikroORM entities are defined using the `defineEntity` / class pattern instead of decorator-based `@Entity()` / `@Property()` annotations.

Reasons:
- Avoids `reflect-metadata` and TypeScript `experimentalDecorators` — the `defineEntity` approach is compatible with modern TypeScript without legacy compiler flags.
- Schema definition is co-located and explicit rather than scattered across class fields as decorators.
- Cleaner separation between the domain class and its persistence mapping.

See: [MikroORM docs — comparison of approaches](https://mikro-orm.io/docs/using-decorators#comparison-of-approaches) and [defineEntity pattern](https://mikro-orm.io/docs/define-entity#the-defineentity--class-pattern-recommended).


# ADR-003: No `MikroOrmRepositoryBase` until proven necessary

**Status:** Accepted
**Date:** 2026-03-17

## Context

Each infrastructure repository adapter will share a predictable set of operations: `findOneById`, `save` (with Domain Event publication), and `delete`. A shared base class could eliminate this boilerplate.

## Decision

Do not create `MikroOrmRepositoryBase` now. Write the first 2–3 repositories manually. Extract a base class only when the repeated pattern is observed in real code — not speculatively.

## Rationale

Most repositories in this system are query-heavy (custom filters, pagination, cross-field lookups). The generic `save` / `findOneById` / `delete` trio may account for a small fraction of each repository's surface area. A base class built before that ratio is known risks being a premature abstraction: it couples all repositories to a shared inheritance chain to save three methods that may not even be the dominant pattern.

## Revisit when

Three or more repositories contain a copy-pasted `save` block that maps to ORM, calls `persistAndFlush`, and publishes Domain Events. At that point extract exactly what repeats — nothing more.


# ADR-004: One HTTP controller per module

**Status:** Accepted
**Date:** 2026-03-21

## Context

During early development, the codebase used one HTTP controller per feature (i.e. per command or query — `DraftOrderController`, `GetOrderController`, etc.), registering multiple controllers in a single NestJS module's `controllers` array.

This caused a concrete runtime issue: NestJS resolved controllers by their index in the array. When multiple single-feature controllers were registered in the same module, they overwrote each other depending on their order, producing silent routing failures that were difficult to diagnose.

## Decision

Each module exposes exactly one `HttpController` class (e.g. `SalesHttpController`). All HTTP endpoints for that module's features are methods on that single controller.

## Consequences

### Positive
- Eliminates the NestJS multi-controller index collision issue entirely.
- Route grouping is explicit — all Sales endpoints are visibly co-located in one file.
- Single controller per module aligns naturally with the one-module-per-bounded-context structure.

### Negative
- Controller file grows as the module gains more endpoints. Mitigated by keeping handler methods thin — each method delegates immediately to a command or query, holding no logic of its own.
- BDD and integration tests that target individual endpoints must import the full controller rather than a focused single-feature one. In practice this has negligible impact since tests call endpoints via HTTP, not by instantiating the controller directly.

## Rejected alternative

One controller per command/query. Rejected due to the runtime routing collision described above. May be revisited if NestJS resolves the underlying issue in a future major version.


# ADR-005: `Object.defineProperty` for internal fields in `Entity` and `AggregateRoot`

**Status:** Accepted, pending review
**Date:** 2026-03-21

## Context

Both `Entity` and `AggregateRoot` use `Object.defineProperty` to initialize their internal fields, combined with TypeScript's `declare` keyword to suppress the compiler's own field initialization.

In `Entity` (`entity.abstract.ts`), four fields are defined this way: `_id`, `_createdAt`, `_updatedAt`, and `_properties`. All are set with `enumerable: false`. `_properties` additionally uses `writable: false, configurable: false` — making it a true runtime constant, beyond what TypeScript's `readonly` can guarantee.

In `AggregateRoot` (`aggregate-root.abstract.ts`), `_domainEvents` is defined with `enumerable: false, writable: true` — it must be reassignable (via `clearEvents()`), but must not appear in serialized output.

The motivation in both cases is the same: these fields are internal infrastructure concerns that must not leak into `JSON.stringify`, `Object.keys()`, or spread operations.

Importantly, `Entity.toJSON()` is explicitly defined and returns only `{ id, ...properties }` — so the non-enumerability of internal fields already has a controlled serialization path in place.

## Decision

Keep the current `defineProperty` approach for now.

## Rationale for keeping it

- `_properties` on `Entity` benefits from `writable: false, configurable: false` — a runtime immutability guarantee that TypeScript's `readonly` does not provide. This is a meaningful distinction.
- `_domainEvents` must be non-enumerable to avoid leaking event payloads in any serialization path not routed through `toJSON()`.
- The pattern is already consistently applied across both base classes, so removing it partially would be inconsistent.

## Simplification path

The `defineProperty` usage can be reconsidered in two independent parts:

**For `_domainEvents` in `AggregateRoot`:** Can be replaced with a plain class field if all aggregates are serialized exclusively through mappers and never directly. Replacement:
```typescript
private _domainEvents: DomainEvent<Properties>[] = [];
```

**For `_id`, `_createdAt`, `_updatedAt` in `Entity`:** Can be replaced with plain class fields — the `toJSON()` method already guarantees controlled output regardless of enumerability.

**For `_properties` in `Entity`:** Replacement requires care. A plain `private readonly _properties` would lose the runtime `writable: false` guarantee. Acceptable only if `Object.freeze()` is applied to properties at construction time as a substitute.

## Revisit when

A full audit of serialization paths confirms that no entity or aggregate is ever serialized outside of a mapper's `toJSON()` call, and the team is comfortable relying on TypeScript `readonly` rather than runtime `writable: false` for `_properties`.