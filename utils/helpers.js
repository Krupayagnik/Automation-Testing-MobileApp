// ============================================================
// FILE: utils/helpers.js
// PURPOSE: Reusable helper functions used across ALL test files
// Think of this as your "toolbox" - common actions you use everywhere
// ============================================================

const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// SECTION 1: SCREENSHOT HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Takes a screenshot and saves it to the /screenshots folder
 * @param {object} page    - Playwright page object
 * @param {string} name    - Name for the screenshot file (no extension needed)
 * @example await takeScreenshot(page, 'login-success');
 */
async function takeScreenshot(page, name) {
  // Create screenshots folder if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Add timestamp to filename so screenshots don't overwrite each other
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `${name}-${timestamp}.png`;
  const filePath = path.join(screenshotsDir, fileName);

  // Take the actual screenshot
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`📸 Screenshot saved: ${fileName}`);

  return filePath;
}

/**
 * Takes a screenshot on test failure automatically
 * Call this inside a catch block or afterEach
 * @param {object} page       - Playwright page object
 * @param {string} testName   - Name of the failing test
 */
async function takeFailureScreenshot(page, testName) {
  const safeName = testName.replace(/[^a-zA-Z0-9]/g, '_'); // Remove special chars
  await takeScreenshot(page, `FAILURE_${safeName}`);
}


// ─────────────────────────────────────────────────────────────
// SECTION 2: WAIT HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Wait for a specific number of milliseconds
 * Use sparingly - only when you have NO other option
 * @param {number} ms - Milliseconds to wait (1000 = 1 second)
 * @example await waitFor(2000); // wait 2 seconds
 */
async function waitFor(ms) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait until an element is visible on screen
 * @param {object} page     - Playwright page object
 * @param {string} selector - CSS selector or text locator
 * @param {number} timeout  - Max wait time in ms (default 15 seconds)
 */
async function waitForElement(page, selector, timeout = 15000) {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    return true;
  } catch (error) {
    console.log(`⚠️  Element not found: ${selector}`);
    return false;
  }
}

/**
 * Wait until an element disappears from screen (like a loading spinner)
 * @param {object} page     - Playwright page object
 * @param {string} selector - CSS selector of the loading element
 */
async function waitForLoadingToFinish(page, selector = '[data-testid="loading"]') {
  try {
    // First check if loader even exists
    const loader = page.locator(selector);
    const count = await loader.count();

    if (count > 0) {
      // Wait for it to disappear
      await loader.waitFor({ state: 'hidden', timeout: 30000 });
      console.log('⏳ Loading finished');
    }
  } catch (error) {
    // Loader might have already disappeared - that's fine
    console.log('ℹ️  No loading indicator found (might be fine)');
  }
}


// ─────────────────────────────────────────────────────────────
// SECTION 3: INPUT HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Clears a text field and types new text
 * More reliable than just typing (avoids appending to existing text)
 * @param {object} page      - Playwright page object
 * @param {string} selector  - Locator for the input field
 * @param {string} text      - Text to type
 */
async function clearAndType(page, selector, text) {
  const element = page.locator(selector);
  await element.click();
  await element.clear();         // Clear existing text
  await element.fill(text);      // Type new text
  console.log(`⌨️  Typed "${text}" into ${selector}`);
}

/**
 * Scroll down the page by a fixed amount
 * Useful for mobile where you need to swipe/scroll
 * @param {object} page    - Playwright page object
 * @param {number} pixels  - How many pixels to scroll (default 300)
 */
async function scrollDown(page, pixels = 300) {
  await page.evaluate((px) => window.scrollBy(0, px), pixels);
  await waitFor(500); // Small wait for content to load
}

/**
 * Scroll to the bottom of the page
 * @param {object} page - Playwright page object
 */
async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await waitFor(1000);
}


// ─────────────────────────────────────────────────────────────
// SECTION 4: ASSERTION HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Check if an element exists AND is visible on screen
 * Returns true/false instead of throwing error
 * @param {object} page     - Playwright page object
 * @param {string} selector - CSS selector or locator
 */
async function isElementVisible(page, selector) {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Assert that a success message or toast is shown
 * Checks for common success message patterns
 * @param {object} page    - Playwright page object
 * @param {string} message - Expected success message text (optional)
 */
async function assertSuccessToast(page, message) {
  // Look for common toast/snackbar selectors
  const toastSelectors = [
    '[class*="toast"]',
    '[class*="snackbar"]',
    '[class*="success"]',
    '[role="alert"]',
    '[class*="notification"]'
  ];

  let found = false;
  for (const selector of toastSelectors) {
    const visible = await isElementVisible(page, selector);
    if (visible) {
      found = true;
      if (message) {
        // If message text is provided, verify it
        const toastText = await page.locator(selector).textContent();
        console.log(`✅ Toast message: "${toastText}"`);
      }
      break;
    }
  }

  if (!found && message) {
    // Fallback: check if message appears anywhere on page
    await expect(page.getByText(message, { exact: false })).toBeVisible({ timeout: 5000 });
  }
}


// ─────────────────────────────────────────────────────────────
// SECTION 5: URL / NAVIGATION HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Navigate to a URL and wait for it to load
 * @param {object} page - Playwright page object
 * @param {string} url  - Full URL to navigate to
 */
async function navigateTo(page, url) {
  console.log(`🌐 Navigating to: ${url}`);
  await page.goto(url, {
    waitUntil: 'domcontentloaded', // Wait until HTML is loaded
    timeout: 60000
  });
  console.log(`✅ Page loaded: ${page.url()}`);
}

/**
 * Get the current page URL
 * @param {object} page - Playwright page object
 */
function getCurrentUrl(page) {
  return page.url();
}


// ─────────────────────────────────────────────────────────────
// SECTION 6: TEST DATA GENERATORS
// ─────────────────────────────────────────────────────────────

/**
 * Generate a unique email address for testing
 * Example output: testuser_1712345678901@example.com
 */
function generateUniqueEmail() {
  const timestamp = Date.now();
  return `testuser_${timestamp}@example.com`;
}

/**
 * Generate a random username for testing
 * Example output: user_abc12
 */
function generateUsername() {
  const random = Math.random().toString(36).substring(2, 7); // 5 random chars
  return `user_${random}`;
}

/**
 * Generate a random phone number (for testing only)
 * Example output: 9876543210
 */
function generatePhoneNumber() {
  const digits = Math.floor(Math.random() * 9000000000) + 1000000000;
  return digits.toString();
}


// ─────────────────────────────────────────────────────────────
// EXPORT ALL FUNCTIONS
// So other files can use: const { takeScreenshot } = require('../utils/helpers')
// ─────────────────────────────────────────────────────────────
module.exports = {
  takeScreenshot,
  takeFailureScreenshot,
  waitFor,
  waitForElement,
  waitForLoadingToFinish,
  clearAndType,
  scrollDown,
  scrollToBottom,
  isElementVisible,
  assertSuccessToast,
  navigateTo,
  getCurrentUrl,
  generateUniqueEmail,
  generateUsername,
  generatePhoneNumber,
};
