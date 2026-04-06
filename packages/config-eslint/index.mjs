import js from '@eslint/js';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ignoredPaths = [
  '**/.next/**',
  '**/coverage/**',
  '**/dist/**',
  '**/node_modules/**',
  '**/next-env.d.ts',
];

const typedConfig = {
  files: ['**/*.{ts,tsx,mts,cts}'],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
};

const globalConfig = {
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
    },
  },
};

const baseConfig = [
  { ignores: ignoredPaths },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  globalConfig,
  typedConfig,
];

const nextConfig = [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
];

export { baseConfig, nextConfig };
export default baseConfig;
