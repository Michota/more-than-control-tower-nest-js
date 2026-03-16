export default {
    "*.{ts,js}": ["eslint --fix", "prettier --write --no-error-on-unmatched-pattern"],
    "*.json": ["prettier --write --no-error-on-unmatched-pattern"],
};
