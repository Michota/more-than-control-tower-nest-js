import { ValueObject } from "@src/libs/ddd";
import z, { ZodType } from "zod";

export abstract class ValueObjectWithSchema<
    S extends ZodType,
    T /* extends z.infer<S> */ = z.infer<S>,
> extends ValueObject<T> {
    protected abstract schema: S;

    /**
     * This method should be called in the constructor of the child class after setting the properties, to validate the properties against the schema.
     */
    validate(): void {
        this.schema.parse(this.properties);
    }
}
