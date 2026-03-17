import { defineEntity, p } from "@mikro-orm/core";
import { currency } from "@src/shared/persistence/currency.property";
import { Product } from "./product.entity";

const OrderLineSchema = defineEntity({
    name: "OrderLine",
    embeddable: true,
    properties: {
        product: () => p.manyToOne(Product),
        quantity: p.integer(),
        vatRate: p.decimal(),
        currency,
    },
});

class OrderLine extends OrderLineSchema.class {}

OrderLineSchema.setClass(OrderLine);

export { OrderLine };
