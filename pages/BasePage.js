const { expect } = require('@playwright/test');
const { takeScreenshot, waitFor, isElementVisible } = require('../utils/helpers');

class BasePage {

  constructor(page) {
    this.page = page; // Store page so all methods can use it
  }

  // NAVIGATION

  /**
   * Open a URL in the browser
   */
  async goto(url) {
    console.log(`\n🌐 Opening: ${url}`);
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  }

  /**
   * Reload/refresh the current page
   */
  async reload() {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  /**
   * Get the current page URL as a string
   */
  getCurrentUrl() {
    return this.page.url();
  }

  // CLICKING
 
  /**
   * Click on an element
   */
  async click(selector) {
    console.log(`🖱️  Clicking: ${selector}`);
    await this.page.locator(selector).click({ timeout: 15000 });
  }

  /**
   * Click element by visible text
   */
  async clickByText(text) {
    console.log(`🖱️  Clicking text: "${text}"`);
    await this.page.getByText(text, { exact: false }).first().click();
  }

  // TYPING / INPUT
 
  /**
   * Type text into an input field (clears first)
   * @param {string} text     - Text to type
   */
  async type(selector, text) {
    console.log(`⌨️  Typing "${text}" into ${selector}`);
    const input = this.page.locator(selector);
    await input.click();
    await input.clear();
    await input.fill(text);
  }

  /**
   * Get the current value of an input field
   */
  async getValue(selector) {
    return await this.page.locator(selector).inputValue();
  }

  /**
   * Get text content of any element
   */
  async getText(selector) {
    return await this.page.locator(selector).textContent();
  }

  // VISIBILITY CHECKS
  
  /**
   * Check if element is visible - returns true or false
   */
  async isVisible(selector) {
    try {
      return await this.page.locator(selector).isVisible({ timeout: 5000 });
    } catch {
      return false;
    }
  }

  /**
   * Assert (verify) that element IS visible - FAILS test if not found
   */
  async assertVisible(selector, message = '') {
    await expect(this.page.locator(selector))
      .toBeVisible({ timeout: 15000 })
      .catch(err => {
        throw new Error(message || `Element not visible: ${selector}\n${err.message}`);
      });
  }

  /**
   * Assert that element is NOT visible
   */
  async assertNotVisible(selector) {
    await expect(this.page.locator(selector)).not.toBeVisible({ timeout: 10000 });
  }

  // TEXT ASSERTIONS

  /**
   * Assert page contains specific text anywhere
   */
  async assertPageContainsText(text) {
    console.log(`🔍 Checking page has text: "${text}"`);
    await expect(this.page.getByText(text, { exact: false }))
      .toBeVisible({ timeout: 10000 });
  }

  /**
   * Assert URL contains a specific string
   */
  async assertUrlContains(urlPart) {
    await expect(this.page).toHaveURL(new RegExp(urlPart), { timeout: 15000 });
    console.log(`✅ URL contains: ${urlPart}`);
  }

  // SCREENSHOT

  /**
   * Take a screenshot and save it to /screenshots folder
   */
  async screenshot(name) {
    await takeScreenshot(this.page, name);
  }

  // SCROLLING (Mob

  /**
   * @param {number} pixels - How far to scroll (default 400px)
   */
  async scrollDown(pixels = 400) {
    await this.page.evaluate((px) => window.scrollBy(0, px), pixels);
    await waitFor(500);
  }

  // WAIT HELPERS

  /**
   * Wait for element to appear
   */
  async waitForElement(selector, timeout = 15000) {
    await this.page.locator(selector).waitFor({ state: 'visible', timeout });
  }

  /**
   * Hard wait - use ONLY when necessary
   */
  async wait(ms) {
    await waitFor(ms);
  }
}

// Export the class so other files can use it
module.exports = BasePage;
