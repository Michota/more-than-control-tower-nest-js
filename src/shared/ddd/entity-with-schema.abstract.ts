import { Entity } from "@src/libs/ddd";
import z, { ZodType } from "zod";

export abstract class EntityWithSchema<
    PropertiesSchema extends ZodType,
    T extends z.infer<PropertiesSchema> = z.infer<PropertiesSchema>,
> extends Entity<T> {
    protected abstract schema: PropertiesSchema;

    /**
     * This method should be called in the constructor of the child class after setting the properties, to validate the properties against the schema.
     */
    validate(): void {
        this.schema.parse(this.properties);
    }
}
