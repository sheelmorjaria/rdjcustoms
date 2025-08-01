import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: ['ddf1-92-40-173-97.ngrok-free.app']
  },
  build: {
    chunkSizeWarningLimit: 500
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    testTimeout: 20000, // Increase timeout to 20 seconds
    pool: 'forks', // Use forks for better isolation
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    // Add Jest compatibility
    server: {
      deps: {
        inline: ['@testing-library/react', '@testing-library/user-event']
      }
    },
    // Optimize for React tests
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    // Exclude E2E tests from Vitest (they should run with Playwright)
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/e2e/**',
      '**/*.e2e.*'
    ]
  },
})
