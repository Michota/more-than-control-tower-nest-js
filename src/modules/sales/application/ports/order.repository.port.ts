import { OrderAggregate } from "../../domain/order.aggregate.js";

export interface OrderRepositoryPort {
    findById(id: string): Promise<OrderAggregate | null>;
    findAll(): Promise<OrderAggregate[]>;
    save(order: OrderAggregate): Promise<void>;
    delete(order: OrderAggregate): Promise<void>;
}
