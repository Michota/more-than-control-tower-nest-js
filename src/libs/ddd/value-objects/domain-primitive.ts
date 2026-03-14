import { Primitive } from "type-fest";

export type DomainPrimitiveValue = Primitive | Date;

export interface DomainPrimitive<T extends DomainPrimitiveValue> {
    value: T;
}
