// TODO: Implement once CRM domain entities (Client aggregate) are created.
// Port is defined here so DI tokens can be referenced by handlers without knowledge of adapters.

/**
 * Placeholder for the Client repository port.
 * Replace this interface with the real domain entity type once the CRM
 * domain layer is implemented.
 */
export interface ClientRepositoryPort {
    findById(id: string): Promise<unknown | null>;
    findByIds(ids: string[]): Promise<unknown[]>;
    save(client: unknown): Promise<void>;
    delete(client: unknown): Promise<void>;
}
