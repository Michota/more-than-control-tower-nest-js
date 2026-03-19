import { Entity, EntityProps } from "@src/libs/ddd";
import { Money } from "./money.js";
import { ProductPrice } from "./product-price.value-object.js";

interface ProductProperties {
    price: ProductPrice;
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

    changePrice(newPrice: Money) {
        this.properties.price = new ProductPrice({ price: newPrice, productId: this.id });
    }
}
