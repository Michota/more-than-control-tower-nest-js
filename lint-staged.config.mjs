export default {
    '*.ts': [
        'pnpm run lint',
        'pnpm run format',
        () => 'pnpm run type-check',
    ],
    '*.js': ['pnpm run lint', 'pnpm run format'],
    '*.json': ['pnpm run format'],
};
