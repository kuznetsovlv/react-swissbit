import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import dts from 'vite-plugin-dts';
import {defineConfig} from 'vitest/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [
        dts({
            entryRoot: 'src',
            outDirs: ['dist'],
            include: ['src'],
            exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        emptyOutDir: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ReactSwissbit',
            fileName: 'index',
            formats: ['es', 'cjs'],
        },
        rollupOptions: {
            external: ['react', 'react/jsx-runtime'],
        },
        sourcemap: true,
    },
    test: {
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json'],
            reportsDirectory: './coverage',
            include: ['src/**/*.{ts,tsx}'],
            exclude: [
                'src/**/*.test.ts',
                'src/**/*.test.tsx',
                'src/**/*.d.ts',
                'src/**/index.ts',
            ],
        },
    },
});
