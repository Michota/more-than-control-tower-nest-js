import { Injectable } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { DraftOrderCommand } from "../commands/draft-order/draft-order.command.js";
import { DraftOrderDto } from "../dtos/draft-order.dto.js";

@Injectable()
export class OrderService {
    constructor(private readonly commandBus: CommandBus) {}

    async draftOrder(dto: DraftOrderDto): Promise<string> {
        return this.commandBus.execute(
            new DraftOrderCommand({
                customerId: dto.customerId,
                lines: dto.lines,
                currency: dto.currency,
                buyerPriceTypeId: dto.buyerPriceTypeId,
            }),
        );
    }
}
