import { Primitive } from "type-fest";

export const VALUE_OBJECT_VALUE_PROPERTY_KEY = "value";

export type DomainPrimitiveValue = Primitive | Date;

export interface DomainPrimitive<T extends DomainPrimitiveValue> {
    [VALUE_OBJECT_VALUE_PROPERTY_KEY]: T;
}

export function isDomainPrimitiveAbstract<T>(obj: unknown): obj is DomainPrimitive<T & DomainPrimitiveValue> {
    if (Object.prototype.hasOwnProperty.call(obj, VALUE_OBJECT_VALUE_PROPERTY_KEY)) {
        return true;
    }
    return false;
}
