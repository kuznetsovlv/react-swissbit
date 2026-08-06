import js from '@eslint/js';
import {defineConfig} from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default defineConfig(
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        rules: {
            'no-console': ['warn', {allow: ['warn', 'error']}],
            'prefer-const': 'error',
        },
    },
    {
        ignores: ['dist', 'coverage', 'node_modules'],
    },
    {
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'sort-imports': [
                'error',
                {
                    ignoreCase: false,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                    memberSyntaxSortOrder: [
                        'none',
                        'all',
                        'multiple',
                        'single',
                    ],
                    allowSeparatedGroups: true,
                },
            ],
        },
    },
    eslintConfigPrettier
);
