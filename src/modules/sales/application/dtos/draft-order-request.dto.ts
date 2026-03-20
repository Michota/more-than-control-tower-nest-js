import { Type } from "class-transformer";
import { IsOptional, IsUUID, ValidateNested } from "class-validator";
import { CustomerDto } from "./customer.dto";
import { OrderLineDto } from "./order-line.dto";

export class DraftOrderRequest {
    @IsOptional()
    @IsUUID()
    orderId?: string;
    @ValidateNested()
    @Type(() => CustomerDto)
    customer!: CustomerDto;
    @ValidateNested({ each: true })
    @Type(() => OrderLineDto)
    lines!: OrderLineDto[];
}
