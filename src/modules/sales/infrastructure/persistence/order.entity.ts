import { defineEntity, p } from "@mikro-orm/core";
import { OrderStatus } from "../../domain/order.status";
import { OrderLine } from "./order-line.embeddable";
import { currency } from "@src/shared/persistence/currency.property";

const OrderSchema = defineEntity({
    name: "Order",
    tableName: "orders",
    properties: {
        id: p.uuid().primary(),
        cost: p.decimal().nullable(),
        currency,
        status: p.enum(() => OrderStatus),
        orderLines: p.embedded(OrderLine).array().default([]),
        customerId: p.uuid,
    },
});

class Order extends OrderSchema.class {}

OrderSchema.setClass(Order);

export { Order };
