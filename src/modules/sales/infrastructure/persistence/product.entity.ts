import { defineEntity, p } from "@mikro-orm/core";
import { Price } from "./price.entity";

const ProductSchema = defineEntity({
    name: "Product",
    tableName: "products", // ? there's a chance we might need to rename it to "items", as it's more "atomic". Bundles can be considered products, but items not.
    properties: {
        id: p.uuid(),
        productName: p.string(),
        // category
        availableFrom: p.datetime(),
        availableTo: p.datetime().nullable(), // null means its still active
        prices: p.oneToMany(Price),
    },
});

class Product extends ProductSchema.class {}

ProductSchema.setClass(Product);

export { Product };
