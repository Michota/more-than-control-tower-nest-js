import { Money } from '../../../shared/domain/value-objects/money.js';
import { Product } from '../../../shared/domain/value-objects/product.js';
import { OrderLines } from './order-lines.js';
import { OrderStatus } from './order-status.enum.js';
import { OrderId } from './value-objects/order-id.js';

export class Order {
    private constructor(
        readonly orderId: OrderId,
        private orderLines: OrderLines,
        private status: OrderStatus,
        private price: Money,
        readonly createdAt: Date,
    ) {}

    static draft(orderLines: OrderLines): Order {
        if (orderLines.isEmpty()) {
            throw new Error('Cannot draft an order with no order lines');
        }
        return new Order(new OrderId(), orderLines, OrderStatus.DRAFTED, orderLines.getTotalPrice(), new Date());
    }

    static reconstitute(
        orderId: OrderId,
        orderLines: OrderLines,
        status: OrderStatus,
        price: Money,
        createdAt: Date,
    ): Order {
        return new Order(orderId, orderLines, status, price, createdAt);
    }

    isEditable(): boolean {
        return this.status === OrderStatus.DRAFTED;
    }

    private validateEditability(): void {
        if (!this.isEditable()) {
            throw new Error('Cannot modify a non-editable order');
        }
    }

    getPrice(): Money {
        if (this.isEditable()) {
            this.price = this.orderLines.getTotalPrice();
        }
        return this.price;
    }

    getStatus(): OrderStatus {
        return this.status;
    }

    getOrderLines(): OrderLines {
        return this.orderLines;
    }

    addProduct(product: Product, quantity: number): void {
        this.validateEditability();
        this.orderLines = this.orderLines.addProduct(product, quantity);
    }

    changeProductQuantity(product: Product, quantity: number): void {
        this.validateEditability();
        this.orderLines = this.orderLines.changeQuantityOfProduct(product, quantity);
    }

    removeProduct(product: Product): void {
        this.validateEditability();
        this.orderLines = this.orderLines.removeProduct(product);
    }

    confirm(): void {
        this.verifyIfStatusCanBeChanged(OrderStatus.CONFIRMED);
        this.price = this.orderLines.getTotalPrice();
        this.status = OrderStatus.CONFIRMED;
    }

    cancel(): void {
        this.verifyIfStatusCanBeChanged(OrderStatus.CANCELLED);
        this.status = OrderStatus.CANCELLED;
    }

    complete(): void {
        this.verifyIfStatusCanBeChanged(OrderStatus.COMPLETED);
        this.status = OrderStatus.COMPLETED;
    }

    private verifyIfStatusCanBeChanged(targetStatus: OrderStatus): void {
        const allowed: Partial<Record<OrderStatus, OrderStatus[]>> = {
            [OrderStatus.DRAFTED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
        };

        const allowedTargets = allowed[this.status];
        if (!allowedTargets || !allowedTargets.includes(targetStatus)) {
            throw new Error(`Cannot transition order from ${this.status} to ${targetStatus}`);
        }
    }
}
