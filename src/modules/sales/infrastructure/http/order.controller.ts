import { Body, Controller, Post } from "@nestjs/common";
import { OrderService } from "../../application/services/order.service.js";
import { DraftOrderRequest } from "./dto/draft-order.request.dto.js";

@Controller("order")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post("draft")
    async draftOrder(@Body() body: DraftOrderRequest): Promise<{ orderId: string }> {
        const orderId = await this.orderService.draftOrder({
            customerId: body.customerId,
            lines: body.lines,
            currency: body.currency,
            buyerPriceTypeId: body.buyerPriceTypeId,
        });
        return { orderId };
    }
}
