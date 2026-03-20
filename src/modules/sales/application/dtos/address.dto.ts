import { IsString } from "class-validator";

export class AddressDto {
    @IsString()
    country!: string;
    @IsString()
    state!: string;
    @IsString()
    city!: string;
    @IsString()
    postalCode!: string;
    @IsString()
    street!: string;
}
