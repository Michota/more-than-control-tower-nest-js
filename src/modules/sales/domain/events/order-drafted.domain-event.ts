import { DomainEvent, DomainEventProperties } from "@src/libs/ddd";
import { Customer } from "@src/shared/value-objects/customer";
import { OrderLines } from "../order-lines.value-object";

export class OrderDraftedDomainEvent extends DomainEvent {
    readonly customer: Customer;
    readonly orderLines: OrderLines;

    constructor(properties: DomainEventProperties<OrderDraftedDomainEvent>) {
        super(properties);

        // TODO: check if this can be remove as it seems redundant to declare these twice
        this.customer = properties.customer;
        this.orderLines = properties.orderLines;
    }
}
