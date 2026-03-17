import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OrderRepositoryPort } from "../../application/ports/order.repository.port.js";
import { OrderAggregate } from "../../domain/order.aggregate.js";
import { FakturowniaOrderMapper } from "./fakturownia-order.mapper.js";

@Injectable()
export class FakturowniaOrderRepository implements OrderRepositoryPort {
    constructor(private readonly config: ConfigService) {}

    private get baseUrl(): string {
        return this.config.getOrThrow<string>("FAKTUROWNIA_URL");
    }

    private get token(): string {
        return this.config.getOrThrow<string>("FAKTUROWNIA_TOKEN");
    }

    async findById(id: string): Promise<OrderAggregate | null> {
        const res = await fetch(`${this.baseUrl}/invoices/${id}.json?api_token=${this.token}`);
        if (!res.ok) return null;
        const raw = (await res.json()) as Record<string, unknown>;
        return FakturowniaOrderMapper.toDomain(raw);
    }

    async findAll(): Promise<OrderAggregate[]> {
        const res = await fetch(`${this.baseUrl}/invoices.json?api_token=${this.token}`);
        if (!res.ok) return [];
        const raws = (await res.json()) as Record<string, unknown>[];
        return raws.map((raw) => FakturowniaOrderMapper.toDomain(raw));
    }

    /**
     * External API adapter saves immediately — no persist/flush pattern.
     * NoOpUnitOfWork.commit() is a no-op for this adapter.
     */
    async save(order: OrderAggregate): Promise<void> {
        const payload = FakturowniaOrderMapper.toApi(order);
        await fetch(`${this.baseUrl}/invoices.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ api_token: this.token, invoice: payload }),
        });
    }

    async delete(order: OrderAggregate): Promise<void> {
        await fetch(`${this.baseUrl}/invoices/${order.id as string}.json?api_token=${this.token}`, {
            method: "DELETE",
        });
    }
}
