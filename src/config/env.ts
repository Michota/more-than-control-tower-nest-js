import z from "zod";

const envSchema = z.object({
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string(),
    DB_NAME: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

const result = envSchema.safeParse(Object.assign({}, process.env));

if (!result.success) {
    console.error("Invalid environment variables:", z.prettifyError(result.error));
    throw new Error("Invalid environment variables");
}

export const env = result.data;
