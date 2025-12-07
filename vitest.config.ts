
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        exclude: ['**/node_modules/**', '**/*.spec.ts'],
        alias: {
            '@': path.resolve(__dirname, './'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json'],
            exclude: [
                'node_modules/**',
                'coverage/**',
                '**/*.test.ts',
                '**/*.spec.ts',
                '**/tests/**',
                'scripts/**',
            ],
        },
    },
});
