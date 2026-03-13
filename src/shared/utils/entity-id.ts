import { randomUUID, UUID } from 'crypto';

export abstract class EntityId<T extends string> {
    declare private readonly _brand: T;
    constructor(readonly value: UUID = randomUUID()) {}
}
