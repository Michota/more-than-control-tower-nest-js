import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { EnvironmentVariables } from "./environment-variables";

export function validate(config: Record<string, unknown>) {
    const validated = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(validated);

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validated;
}
