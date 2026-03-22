// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: ["eslint.config.mjs", "src/database/migrations/**"],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            sourceType: "commonjs",
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ["**/*.ts", "**/*.js"],
        ignores: ["**/*.spec.ts", "**/*.spec.js"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        { regex: "\\.spec\\.(ts|js)?$", message: "Production code must not import test files." },
                    ],
                },
            ],
        },
    },
    {
        files: ["**/domain/**/*.ts"],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^(?:\\.\\./)+(?:database|commands|queries)",
                            message:
                                "Domain layer must not import from application or infrastructure layers. Use only /domain, /libs, or /shared.",
                        },
                    ],
                },
            ],
        },
    },
    {
        rules: {
            "prettier/prettier": ["warn", {}, { usePrettierrc: true }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/no-unsafe-argument": "warn",
            "no-restricted-syntax": [
                "error",
                {
                    selector: "MemberExpression[object.name='process'][property.name='env']",
                    message: "Use the typed `env` from src/config/env.ts instead of process.env directly.",
                },
            ],
        },
    },
);
