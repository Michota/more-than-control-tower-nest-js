import { Entity, EntityProps } from "@src/libs/ddd";
import { Money } from "./money.js";

interface ProductProperties {
    readonly price: Money;
}

export class Product extends Entity<ProductProperties> {
    get price() {
        return this.properties.price;
    }

    static create(props: EntityProps<ProductProperties>): Product {
        const product = new Product(props);
        product.validate();
        return product;
    }

    static reconstitute(props: EntityProps<ProductProperties>): Product {
        return new Product(props);
    }

    public validate(): void {
        // no need to validate price, as Money will validate itself
    }
}
