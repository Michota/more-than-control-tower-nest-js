import { IsUUID, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class OrderLineDto {
    @IsUUID()
    productId!: string;
    @IsNumber()
    @IsPositive()
    price!: number;
    @IsString()
    currency!: string;
    @IsNumber()
    @Min(1)
    quantity!: number;
}
