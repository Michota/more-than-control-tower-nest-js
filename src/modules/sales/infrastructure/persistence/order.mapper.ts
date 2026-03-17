import { EntityId } from "@src/libs/ddd/entities/entity-id.js";
import { Currency } from "@src/shared/value-objects/currency.js";
import { Money } from "@src/shared/value-objects/money.js";
import { Product as DomainProduct } from "@src/shared/value-objects/product.js";
import Decimal from "decimal.js";
import { OrderCustomer } from "../../domain/order-customer.entity.js";
import { OrderLine as DomainOrderLine } from "../../domain/order-line.value-object.js";
import { OrderLines } from "../../domain/order-lines.value-object.js";
import { OrderAggregate } from "../../domain/order.aggregate.js";
import { OrderStatus } from "../../domain/order-status.enum.js";
import { Order } from "./order.entity.js";

/**
 * Data shape passed to em.create(Order, data) in the repository.
 * Uses plain scalar types — no ORM entity instances, no domain objects.
 */
export type OrderOrmData = {
    id: string;
    cost: string | null;
    currency: string;
    status: OrderStatus;
    customerId: string;
    orderLines: { product: { id: string }; quantity: number }[];
};

export class OrderMapper {
    /**
     * Maps an ORM Order (with populated orderLines.product.prices) to a domain OrderAggregate.
     *
     * NOTE: customer is intentionally left as undefined — OrderCustomer cannot be
     * reconstituted from customerId alone. The handler must resolve it via
     * the CRM QueryBus before calling save(), or after calling findById().
     */
    static toDomain(record: Order): OrderAggregate {
        const currency = new Currency(record.currency);

        const lines = new Map(
            record.orderLines.map((line) => {
                const productId = line.product.id as EntityId;
                // Currency lives on the parent Order; individual lines share it.
                // Active price = the price whose validTo is null (still active).
                const activePrice = line.product.prices.getItems().find((p) => p.validTo === null);
                const price = new Money(new Decimal(String(activePrice?.amount ?? 0)), currency);

                const domainProduct = DomainProduct.reconstitute({
                    id: productId,
                    createdAt: new Date(),
                    properties: { price },
                });

                return [productId, new DomainOrderLine({ product: domainProduct, quantity: line.quantity })];
            }),
        );

        return OrderAggregate.reconstitute({
            id: record.id as EntityId,
            createdAt: new Date(),
            properties: {
                cost: new Money(new Decimal(String(record.cost ?? 0)), currency),
                // OrderStatus re-exported in persistence layer is identical to domain enum
                status: record.status as unknown as OrderStatus,
                orderLines: new OrderLines(lines),
                // TODO: resolve OrderCustomer via CRM QueryBus in the repository/handler
                customer: undefined as unknown as OrderCustomer,
            },
        });
    }

    /**
     * Maps a domain OrderAggregate to plain data for em.create(Order, data).
     * Returns scalar types only — MikroORM resolves the product FK from { id }.
     */
    static toOrmData(domain: OrderAggregate): OrderOrmData {
        const props = domain.getProperties().properties;

        return {
            id: domain.id as string,
            cost: domain.cost.amount.toFixed(2),
            currency: domain.cost.currency.code,
            status: props.status,
            customerId: props.customer.id as string,
            orderLines: Array.from(props.orderLines.getLines().entries()).map(([productId, line]) => ({
                product: { id: productId as string },
                quantity: line.quantity,
            })),
        };
    }
}
