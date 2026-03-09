// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // --- DESATIVANDO O FIREFOX TEMPORARIAMENTE ---
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // --- DESATIVANDO O WEBKIT (SAFARI) TEMPORARIAMENTE ---
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Inicia um servidor local antes de rodar os testes (na sua máquina e no GitHub) */
  webServer: {
    command: 'npx serve -p 5500',
    port: 5500,
    reuseExistingServer: !process.env.CI,
  },
});

