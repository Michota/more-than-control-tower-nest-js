type EntityId<T> = string & { __brand: T };

export abstract class Entity<T, Id = EntityId<T>> {
    private _id: Id;
    private _createdAt: Date;
    private _updatedAt?: Date;

    constructor(id: Id, createdAt: Date, updatedAt?: Date) {
        this._id = id;
        this._createdAt = createdAt;
        this._updatedAt = updatedAt;
    }

    get id(): Id {
        return this._id;
    }

    private set id(newId: Id) {
        this._id = newId;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date | undefined {
        return this._updatedAt;
    }
}
