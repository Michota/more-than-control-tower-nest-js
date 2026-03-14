type EntityId<T> = string & { __brand: T };

export abstract class Entity<T, Id = EntityId<T>> {
    id: Id;
    createdAt: Date;
    updatedAt?: Date;

    constructor(id: Id, createdAt: Date, updatedAt?: Date) {
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
