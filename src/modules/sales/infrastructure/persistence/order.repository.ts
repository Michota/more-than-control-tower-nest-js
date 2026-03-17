import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/core";
import { OrderRepositoryPort } from "../../application/ports/order.repository.port.js";
import { OrderAggregate } from "../../domain/order.aggregate.js";
import { Order } from "./order.entity.js";
import { OrderLine as OrmOrderLine } from "./order-line.embeddable.js";
import { Product } from "./product.entity.js";
import { OrderMapper } from "./order.mapper.js";

@Injectable()
export class OrderRepository implements OrderRepositoryPort {
    constructor(private readonly em: EntityManager) {}

    async findById(id: string): Promise<OrderAggregate | null> {
        const record = await this.em.findOne(Order, { id }, { populate: ["orderLines.product.prices"] as const });
        return record ? OrderMapper.toDomain(record) : null;
    }

    async findAll(): Promise<OrderAggregate[]> {
        const records = await this.em.find(Order, {}, { populate: ["orderLines.product.prices"] as const });
        return records.map(OrderMapper.toDomain);
    }

    /**
     * Persists the order to the MikroORM unit of work without flushing.
     * em.flush() is called by MikroOrmUnitOfWork.commit() at the end of the use case.
     */
    async save(order: OrderAggregate): Promise<void> {
        const data = OrderMapper.toOrmData(order);
        // MikroORM v7 with defineEntity uses strict generic types for embedded relations.
        // At runtime, passing { id } for a ManyToOne is valid — MikroORM resolves it to
        // a FK reference on flush. The cast bypasses the TypeScript structural check.
        const orderLines = data.orderLines.map((line) => ({
            product: { id: line.product.id } as unknown as Product,
            quantity: line.quantity,
        })) as unknown as OrmOrderLine[];

        const entity = this.em.create(Order, { ...data, orderLines });
        this.em.persist(entity);
    }

    /**
     * Schedules the order for deletion in the MikroORM unit of work without flushing.
     */
    async delete(order: OrderAggregate): Promise<void> {
        const record = await this.em.findOne(Order, { id: order.id as string });
        if (record) {
            this.em.remove(record);
        }
    }
}
