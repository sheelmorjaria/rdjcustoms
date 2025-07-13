import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import process from 'process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    testTimeout: 20000,
    
    // Better isolation and performance
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // Test file patterns - only integration tests
    include: [
      'src/**/*.integration.test.{js,jsx,ts,tsx}',
      'src/**/*.integration.spec.{js,jsx,ts,tsx}'
    ],
    
    // Exclude all other tests
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      '**/e2e/**',
      '**/*.e2e.*',
      '**/playwright/**',
      '**/*.unit.test.*',
      '**/*.performance.test.*',
      '**/*.security.test.*'
    ],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.config.*',
        '**/e2e/**'
      ]
    },
    
    // Enhanced dependency handling
    server: {
      deps: {
        inline: [
          '@testing-library/react',
          '@testing-library/user-event',
          '@testing-library/jest-dom'
        ]
      }
    },
    
    // Mock reset options
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    
    // Reporter configuration
    reporter: process.env.CI ? ['junit', 'json'] : ['verbose']
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/test')
    }
  }
})