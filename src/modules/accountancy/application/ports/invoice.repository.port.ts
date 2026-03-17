// TODO: Implement once Accountancy domain entities (Invoice aggregate) are created.
// Port is defined here so DI tokens can be referenced by handlers without knowledge of adapters.

/**
 * Placeholder for the Invoice repository port.
 * Replace this interface with the real domain entity type once the Accountancy
 * domain layer is implemented.
 */
export interface InvoiceRepositoryPort {
    findById(id: string): Promise<unknown | null>;
    findAll(): Promise<unknown[]>;
    save(invoice: unknown): Promise<void>;
    delete(invoice: unknown): Promise<void>;
}
