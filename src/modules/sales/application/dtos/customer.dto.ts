import { Type } from "class-transformer";
import { IsOptional, IsUUID, IsString, IsEmail, ValidateNested } from "class-validator";
import { AddressDto } from "./address.dto";

export class CustomerDto {
    @IsOptional()
    @IsUUID()
    id?: string;
    @IsString()
    firstName!: string;
    @IsString()
    secondName!: string;
    @IsEmail()
    email!: string;
    @IsString()
    phoneNumber!: string;
    @ValidateNested()
    @Type(() => AddressDto)
    address!: AddressDto;
}
