// TODO: Implement once Warehouse domain entities (ProductStock aggregate) are created.
// Port is defined here so DI tokens can be referenced by handlers without knowledge of adapters.

/**
 * Placeholder for the ProductStock repository port.
 * Replace this interface with the real domain entity type once the Warehouse
 * domain layer is implemented.
 */
export interface ProductStockRepositoryPort {
    findById(id: string): Promise<unknown | null>;
    findByIds(ids: string[]): Promise<unknown[]>;
    save(stock: unknown): Promise<void>;
    delete(stock: unknown): Promise<void>;
}
