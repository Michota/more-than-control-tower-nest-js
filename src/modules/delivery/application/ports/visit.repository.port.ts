// TODO: Implement once Delivery domain entities (Visit aggregate) are created.
// Port is defined here so DI tokens can be referenced by handlers without knowledge of adapters.
// Delivery module is internal-only (no external adapter planned yet).

/**
 * Placeholder for the Visit repository port.
 * Replace this interface with the real domain entity type once the Delivery
 * domain layer is implemented.
 */
export interface VisitRepositoryPort {
    findById(id: string): Promise<unknown | null>;
    findAll(): Promise<unknown[]>;
    save(visit: unknown): Promise<void>;
    delete(visit: unknown): Promise<void>;
}
