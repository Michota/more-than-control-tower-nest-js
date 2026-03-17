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

/**
 * Anti-Corruption Layer: translates Fakturownia invoice API responses
 * into Sales domain objects. Field names follow Fakturownia's JSON schema.
 *
 * Fakturownia invoice docs: https://github.com/fakturownia/api
 */
export class FakturowniaOrderMapper {
    /**
     * Maps a Fakturownia invoice object to an OrderAggregate.
     *
     * NOTE: customer is left as undefined — must be resolved via CRM QueryBus
     * using buyer_email or an external buyer ID stored in the invoice.
     */
    static toDomain(raw: Record<string, unknown>): OrderAggregate {
        const currencyCode = String(raw["currency"] ?? "PLN").toUpperCase();
        const currency = new Currency(currencyCode);

        const rawPositions = Array.isArray(raw["positions"]) ? (raw["positions"] as Record<string, unknown>[]) : [];

        const lines = new Map(
            rawPositions.map((pos) => {
                const productId = String(pos["product_id"] ?? pos["id"]) as EntityId;
                const unitPrice = new Decimal(String(pos["price_net"] ?? pos["total_price_net"] ?? 0));
                const price = new Money(unitPrice, currency);

                const domainProduct = DomainProduct.reconstitute({
                    id: productId,
                    createdAt: new Date(),
                    properties: { price },
                });

                const quantity = Number(pos["quantity"] ?? 1);
                return [productId, new DomainOrderLine({ product: domainProduct, quantity })];
            }),
        );

        const orderLines = new OrderLines(lines);
        const cost = new Money(new Decimal(String(raw["price_net"] ?? 0)), currency);

        // Map Fakturownia invoice status to internal OrderStatus
        const rawStatus = String(raw["status"] ?? "draft");
        const status = FakturowniaOrderMapper.mapStatus(rawStatus);

        return OrderAggregate.reconstitute({
            id: String(raw["id"] ?? "") as EntityId,
            createdAt: raw["created_at"] ? new Date(String(raw["created_at"])) : new Date(),
            properties: {
                cost,
                status,
                orderLines,
                // TODO: resolve OrderCustomer via CRM QueryBus using raw["buyer_email"] or raw["buyer_id"]
                customer: undefined as unknown as OrderCustomer,
            },
        });
    }

    /**
     * Maps an OrderAggregate to the Fakturownia invoice creation payload.
     */
    static toApi(domain: OrderAggregate): Record<string, unknown> {
        const props = domain.getProperties().properties;

        return {
            kind: "vat",
            currency: domain.cost.currency.code,
            status: FakturowniaOrderMapper.mapStatusToApi(props.status),
            buyer_name: `${props.customer.firstName} ${props.customer.secondName}`,
            buyer_email: props.customer.email,
            positions: Array.from(props.orderLines.getLines().entries()).map(([productId, line]) => ({
                product_id: productId as string,
                quantity: line.quantity,
                price_net: line.subtotal.amount.div(line.quantity).toFixed(2),
            })),
        };
    }

    private static mapStatus(fakturowniaStatus: string): OrderStatus {
        switch (fakturowniaStatus) {
            case "issued":
                return OrderStatus.PLACED;
            case "sent":
            case "viewed":
                return OrderStatus.IN_PROGRESS;
            case "paid":
                return OrderStatus.COMPLETED;
            case "rejected":
            case "cancelled":
                return OrderStatus.CANCELLED;
            default:
                return OrderStatus.DRAFTED;
        }
    }

    private static mapStatusToApi(status: OrderStatus): string {
        switch (status) {
            case OrderStatus.DRAFTED:
                return "draft";
            case OrderStatus.PLACED:
                return "issued";
            case OrderStatus.IN_PROGRESS:
                return "sent";
            case OrderStatus.COMPLETED:
                return "paid";
            case OrderStatus.CANCELLED:
                return "cancelled";
        }
    }
}
