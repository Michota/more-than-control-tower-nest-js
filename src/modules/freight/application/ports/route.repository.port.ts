// TODO: Implement once Freight domain entities (Route aggregate) are created.
// Port is defined here so DI tokens can be referenced by handlers without knowledge of adapters.
// Freight module is internal-only (no external adapter planned yet).

/**
 * Placeholder for the Route repository port.
 * Replace this interface with the real domain entity type once the Freight
 * domain layer is implemented.
 */
export interface RouteRepositoryPort {
    findById(id: string): Promise<unknown | null>;
    findAll(): Promise<unknown[]>;
    save(route: unknown): Promise<void>;
    delete(route: unknown): Promise<void>;
}
