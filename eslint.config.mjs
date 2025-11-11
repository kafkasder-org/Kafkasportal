import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import convexPlugin from '@convex-dev/eslint-plugin';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Custom rules
  {
    rules: {
      // TypeScript strict rules - temporarily warn during migration
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Console rules (allow warn/error, disallow log in production)
      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      // Code quality rules
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'warn',
    },
  },

  // Test files için özel kurallar
  {
    files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      // Test dosyalarında console.log'a izin ver
      'no-console': 'off',
      // Test dosyalarında any kullanımına daha toleranslı ol (ama yine de warn)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // Scripts and tools için özel kurallar
  {
    files: [
      'scripts/**/*.ts',
      'scripts/**/*.js',
      'scripts/**/*.mts',
      'src/scripts/**/*.ts',
      'src/scripts/**/*.js',
    ],
    rules: {
      // Scripts'te console kullanımına izin ver (debugging/diagnostic scripts)
      'no-console': 'off',
      // Scripts'te any kullanımına daha toleranslı ol
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused vars için daha toleranslı ol
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // Convex dosyaları için özel kurallar
  {
    files: ['**/convex/**/*.ts'],
    plugins: {
      '@convex-dev': convexPlugin,
    },
    rules: {
      // Object syntax kullan (handler property ile)
      '@convex-dev/no-old-registered-function-syntax': 'error',
      // Argument validators gerekli (kullanılmayan argümanlar için toleranslı)
      '@convex-dev/require-args-validator': [
        'error',
        {
          ignoreUnusedArguments: true,
        },
      ],
      // Node runtime dosyalarından import yapma
      '@convex-dev/import-wrong-runtime': 'error',
    },
  },

  // Override default ignores
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    '.husky/**',
    'coverage/**',
    'dist/**',
  ]),
]);

export default eslintConfig;
