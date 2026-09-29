import { defineConfig } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT || '4173';

export default defineConfig({
  testDir: './tests',
  timeout: 45000,
  workers: 2,
  reporter: [['list'], ['json', { outputFile: 'docs/test-results.json' }]],
  use: { baseURL: `http://localhost:${port}`, viewport: { width: 1440, height: 1000 }, launchOptions: { executablePath: process.env.CHROME_PATH || '/home/nami/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox'] } },
  webServer: { command: `npm run preview -- --port ${port}`, url: `http://localhost:${port}`, reuseExistingServer: true },
});
