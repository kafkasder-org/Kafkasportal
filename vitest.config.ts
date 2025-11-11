/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    css: true,
    include: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // Exclude Playwright E2E tests
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'e2e/',
        '**/*.d.ts',
        'next.config.ts',
        'postcss.config.mjs',
        'tailwind.config.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/convex': resolve(__dirname, './convex'),
      '@/convex/_generated/api': resolve(__dirname, './src/__tests__/mocks/convex-api.ts'),
      '@/convex/_generated/dataModel': resolve(__dirname, './src/__tests__/mocks/convex-api.ts'),
      '@/convex/_generated/server': resolve(__dirname, './src/__tests__/mocks/convex-api.ts'),
      '../../convex/_generated/api': resolve(__dirname, './src/__tests__/mocks/convex-api.ts'),
    },
  },
});
