import { IsInt, IsString, Max, Min } from "class-validator";

interface IEnvironmentVariables {
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
}

export class EnvironmentVariables implements IEnvironmentVariables {
    @IsString()
    DB_HOST!: string;

    @IsInt()
    @Min(1)
    @Max(65535)
    DB_PORT!: number;

    @IsString()
    DB_USER!: string;

    @IsString()
    DB_PASSWORD!: string;

    @IsString()
    DB_NAME!: string;
}
