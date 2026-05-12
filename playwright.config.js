// ============================================================
// FILE: playwright.config.js
// PURPOSE: Main Playwright configuration for Android mobile testing
// This file controls how ALL tests run - devices, timeouts, reports etc.
// ============================================================

// Import the defineConfig helper and devices list from Playwright
const { defineConfig, devices } = require('@playwright/test');

// Load environment variables from .env file (if it exists)
require('dotenv').config();

module.exports = defineConfig({

  // ─── WHERE ARE THE TEST FILES? ───────────────────────────
  // Playwright will look inside the "tests" folder for files ending in .spec.js
  testDir: './tests',

  // ─── RUN TESTS IN PARALLEL? ──────────────────────────────
  // false = run tests one-by-one (safer for mobile/emulator)
  fullyParallel: false,

  // ─── STOP AFTER N FAILURES ───────────────────────────────
  // If 5 tests fail, stop the rest (saves time)
  maxFailures: 5,

  // ─── RETRY FAILED TESTS? ─────────────────────────────────
  // On CI environment retry 2 times, locally retry 1 time
  retries: process.env.CI ? 2 : 1,

  // ─── HOW MANY PARALLEL WORKERS? ──────────────────────────
  // 1 worker = tests run one at a time (needed for single emulator/device)
  workers: 1,

  // ─── REPORTER SETUP ──────────────────────────────────────
  // This creates the HTML report you can open in browser
  reporter: [
    ['html', {
      outputFolder: 'playwright-report', // Report saved here
      open: 'never'                       // Don't auto-open after test
    }],
    ['list'],   // Shows test progress in terminal line by line
    ['json', { outputFile: 'test-results/results.json' }] // JSON for CI tools
  ],

  // ─── GLOBAL TEST SETTINGS ────────────────────────────────
  use: {
    // How long to wait for each action (click, type, etc.) - 30 seconds
    actionTimeout: 30000,

    // How long to wait for navigation/page load - 60 seconds
    navigationTimeout: 60000,

    // Take screenshot ONLY when a test fails
    screenshot: 'only-on-failure',

    // Record video ONLY when test fails (helps debug)
    video: 'on-first-retry',

    // Capture browser trace on first retry (advanced debugging)
    trace: 'on-first-retry',

    // Where to save test output files
    outputDir: 'test-results/',
  },

  // ─── PROJECTS = DIFFERENT DEVICE CONFIGS ─────────────────
  // Each project runs your tests on a different device/screen size
  projects: [

    // ── Android Mobile (Primary) ────────────────────────────
    // This simulates a real Android phone screen
    {
      name: 'android-mobile',
      use: {
        ...devices['Pixel 5'],         // Use Google Pixel 5 screen size
        // ↑ This gives: 393x851 viewport, touch enabled, mobile user-agent

        // Override viewport to match Android standard
        viewport: { width: 393, height: 851 },

        // Simulate a real Android Chrome browser
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',

        // Enable touch events (important for mobile apps)
        hasTouch: true,

        // Set device scale factor (pixel density)
        deviceScaleFactor: 2.75,

        // Simulate mobile internet speed (optional)
        // launchOptions: { slowMo: 100 }
      },
    },

    // ── Android Tablet (Optional) ───────────────────────────
    {
      name: 'android-tablet',
      use: {
        ...devices['Galaxy Tab S4'],   // Samsung tablet size
        hasTouch: true,
      },
    },

  ],

  // ─── GLOBAL TIMEOUT ──────────────────────────────────────
  // Each individual test has max 2 minutes to complete
  timeout: 120000,

  // ─── EXPECT TIMEOUT ──────────────────────────────────────
  // Each assertion (expect) has 10 seconds to pass
  expect: {
    timeout: 10000,
  },

});
