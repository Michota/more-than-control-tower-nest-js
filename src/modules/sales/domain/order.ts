import { EntityId } from "@src/libs/ddd/index.js";
import { randomUUID } from "crypto";
import { AggregateRoot } from "../../../libs/ddd/aggregate-root.abstract.js";
import { type EntityProps } from "../../../libs/ddd/entities/entity.abstract.js";
import { Money } from "../../../shared/value-objects/money.js";
import { Product } from "../../../shared/value-objects/product.js";
import { OrderLines } from "./order-lines.js";

type OrderProperties = {
    orderLines: OrderLines;
    cost: Money;
};

export class Order extends AggregateRoot<OrderProperties> {
    /**
     * It's not `create`, because we want to enforce that an order must be created as a draft, which means it cannot have different status than draft.
     * This way we can ensure that an order is always created with the same initial state,
     * and we can enforce that an order must have at least one order line before it can be considered as a valid order.
     */
    static draft(orderLines: OrderLines): Order {
        const newOrder = new Order({
            id: randomUUID() as EntityId,
            createdAt: new Date(),
            properties: {
                orderLines,
                cost: orderLines.getTotalPrice(),
            },
        });

        newOrder.validate();

        return newOrder;
    }

    static reconstitute(props: EntityProps<OrderProperties>): Order {
        return new Order(props);
    }

    validate(): void {
        if (!this.properties.orderLines.hasItems()) {
            throw new Error("Order must have at least one order line");
        }
    }

    get cost(): Money {
        return this.properties.cost;
    }

    getOrderLines(): OrderLines {
        return this.properties.orderLines;
    }

    addProduct(product: Product, quantity: number): void {
        this.properties.orderLines = this.properties.orderLines.addProduct(product, quantity);
        this.properties.cost = this.properties.orderLines.getTotalPrice();
    }

    changeProductQuantity(product: Product, quantity: number): void {
        this.properties.orderLines = this.properties.orderLines.changeQuantityOfProduct(product, quantity);
        this.properties.cost = this.properties.orderLines.getTotalPrice();
    }

    removeProduct(product: Product): void {
        this.properties.orderLines = this.properties.orderLines.removeProduct(product);
        this.properties.cost = this.properties.orderLines.getTotalPrice();
    }
}
