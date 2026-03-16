import { randomUUID, UUID } from "crypto";

export class EntityId<Properties> {
    declare private readonly _brand: Properties;

    static generate(): UUID {
        return randomUUID();
    }

    constructor(readonly value: string = EntityId.generate()) {}
}
