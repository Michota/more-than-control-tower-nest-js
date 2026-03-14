import { Primitive } from "type-fest";

export interface DomainPrimitive<T extends Primitive | Date> {
    value: T;
}
