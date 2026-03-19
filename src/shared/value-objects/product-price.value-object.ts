import z from "zod";
import { ValueObjectWithSchema } from "../ddd/value-object-with-schema.abstract";
import { Money } from "./money";

const productPriceSchema = z.object({
    productId: z.string(),
    price: z.instanceof(Money),
});

export type ProductPriceProperties = z.infer<typeof productPriceSchema>;

export class ProductPrice extends ValueObjectWithSchema<z.infer<typeof productPriceSchema>> {
    create(props: ProductPriceProperties): ProductPrice {
        return new ProductPrice(props);
    }

    schema = productPriceSchema;
}
