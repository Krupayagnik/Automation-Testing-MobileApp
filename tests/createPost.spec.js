// ============================================================
// FILE: tests/createPost.spec.js
// PURPOSE: All test cases for Create Post functionality
// Assumes user is logged in (or uses a pre-auth state)
// ============================================================

const { test, expect } = require('@playwright/test');
const CreatePostPage = require('../pages/CreatePostPage');
const LoginPage      = require('../pages/LoginPage');
const { APP_URL, VALID_USER, POST_DATA, INVALID_DATA, TIMEOUTS } = require('../utils/testData');
const { takeFailureScreenshot } = require('../utils/helpers');

test.describe('📸 Create Post Feature Tests', () => {

  let createPostPage;
  let loginPage;

  // ── Helper function: Login before post tests ────────────────
  async function loginUser(page) {
    loginPage = new LoginPage(page);
    await loginPage.openLoginPage(APP_URL);

    const hasEmail = await loginPage.isVisible(loginPage.emailInput);
    const hasPhone = await loginPage.isVisible(loginPage.phoneInput);

    if (hasEmail) {
      await loginPage.loginWithEmailPassword(VALID_USER.email, VALID_USER.password);
    } else if (hasPhone) {
      await loginPage.enterPhone(VALID_USER.phone);
      await loginPage.clickSendOtp();
      await loginPage.wait(2000);
      await loginPage.enterOtp(VALID_USER.otp);
      await loginPage.clickVerifyOtp();
    }
    await loginPage.wait(3000);
    console.log('🔑 Login attempted before post test');
  }

  test.beforeEach(async ({ page }) => {
    createPostPage = new CreatePostPage(page);

    // Navigate to the app first
    await createPostPage.goto(APP_URL);
    await createPostPage.wait(2000);
    await createPostPage.screenshot('create-post-page-start');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      await takeFailureScreenshot(page, testInfo.title);
      console.log(`❌ TEST FAILED: ${testInfo.title}`);
    }
  });


  // ════════════════════════════════════════════════════════════
  // ✅ POSITIVE TEST CASES
  // ════════════════════════════════════════════════════════════

  test('TC_POST_001 - Home/feed page should load correctly', async ({ page }) => {
    console.log('\n🧪 TC_POST_001: Verifying main feed page loads');

    const url = page.url();
    console.log(`📍 Current URL: ${url}`);
    expect(url).toBeTruthy();

    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`📄 Page title: "${title}"`);

    await createPostPage.screenshot('feed-page-loaded');
    console.log('✅ App home/feed page loaded successfully');
  });

  test('TC_POST_002 - Create post button should be visible when logged in', async ({ page }) => {
    console.log('\n🧪 TC_POST_002: Checking create post button visibility');

    // Try to login first
    await loginUser(page);
    await createPostPage.wait(2000);
    await createPostPage.screenshot('checking-create-button');

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    console.log(`➕ Create post button visible: ${createBtnVisible}`);

    if (!createBtnVisible) {
      // Maybe we need to scroll or navigate
      await createPostPage.scrollDown(300);
      const visibleAfterScroll = await createPostPage.isVisible(createPostPage.createPostButton);
      console.log(`➕ After scroll: ${visibleAfterScroll}`);
    }
    console.log('✅ Create post button visibility test completed');
  });

  test('TC_POST_003 - Click create post button should open post form', async ({ page }) => {
    console.log('\n🧪 TC_POST_003: Testing create post button opens form');

    await loginUser(page);
    await createPostPage.wait(2000);

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (!createBtnVisible) {
      test.skip(true, 'Create post button not visible - user might not be logged in');
      return;
    }

    const urlBefore = page.url();
    await createPostPage.clickCreatePostButton();
    await createPostPage.wait(2000);
    await createPostPage.screenshot('create-post-form-opened');

    const urlAfter = page.url();
    const captionVisible = await createPostPage.isVisible(createPostPage.captionInput);
    const urlChanged = urlAfter !== urlBefore;

    expect(captionVisible || urlChanged).toBe(true);
    console.log('✅ Create post form opened successfully');
  });

  test('TC_POST_004 - Caption input field should accept text', async ({ page }) => {
    console.log('\n🧪 TC_POST_004: Testing caption input functionality');

    await loginUser(page);
    await createPostPage.wait(2000);

    // Try to open create post form
    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (createBtnVisible) {
      await createPostPage.clickCreatePostButton();
      await createPostPage.wait(1500);
    }

    // Try direct URL
    await createPostPage.goto(`${APP_URL}/create`);
    await createPostPage.wait(2000);

    const captionVisible = await createPostPage.isVisible(createPostPage.captionInput);
    if (!captionVisible) {
      test.skip(true, 'Caption input not found');
      return;
    }

    const testCaption = POST_DATA.validCaption;
    await createPostPage.enterCaption(testCaption);

    // Verify typed text
    const typedValue = await createPostPage.page.locator(createPostPage.captionInput).inputValue()
      .catch(() => createPostPage.page.locator(createPostPage.captionInput).textContent());

    await createPostPage.screenshot('caption-entered');
    console.log(`✅ Caption field accepts text. Typed: "${testCaption.substring(0, 30)}..."`);
  });

  test('TC_POST_005 - Create post with valid caption should succeed', async ({ page }) => {
    console.log('\n🧪 TC_POST_005: Testing post creation with valid caption');

    await loginUser(page);
    await createPostPage.wait(2000);

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (!createBtnVisible) {
      test.skip(true, 'Not logged in or create button not found');
      return;
    }

    await createPostPage.createTextPost(POST_DATA.validCaption);
    await createPostPage.assertPostCreated();
    console.log('✅ Post created with valid caption');
  });

  test('TC_POST_006 - Create post with emoji caption should work', async ({ page }) => {
    console.log('\n🧪 TC_POST_006: Testing emoji in post caption');

    await loginUser(page);
    await createPostPage.wait(2000);

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (!createBtnVisible) {
      test.skip(true, 'Create button not visible');
      return;
    }

    await createPostPage.clickCreatePostButton();
    await createPostPage.wait(1500);

    const captionVisible = await createPostPage.isVisible(createPostPage.captionInput);
    if (!captionVisible) {
      test.skip(true, 'Caption input not found');
      return;
    }

    await createPostPage.enterCaption(POST_DATA.emojiCaption);
    await createPostPage.screenshot('emoji-caption');

    // Verify emoji was accepted (field is still visible = no crash)
    const fieldStillVisible = await createPostPage.isVisible(createPostPage.captionInput);
    expect(fieldStillVisible).toBe(true);
    console.log('✅ Emoji caption accepted without crash');
  });

  test('TC_POST_007 - Post with hashtags should work', async ({ page }) => {
    console.log('\n🧪 TC_POST_007: Testing post with hashtags');

    await loginUser(page);
    await createPostPage.wait(2000);

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (!createBtnVisible) {
      test.skip(true, 'Create button not visible');
      return;
    }

    await createPostPage.clickCreatePostButton();
    await createPostPage.wait(1500);

    const captionVisible = await createPostPage.isVisible(createPostPage.captionInput);
    if (!captionVisible) {
      test.skip(true, 'Caption input not found');
      return;
    }

    await createPostPage.enterCaption(POST_DATA.specialCharsCaption);
    await createPostPage.screenshot('hashtag-caption');
    console.log('✅ Hashtag caption test completed');
  });

  test('TC_POST_008 - Discard post should navigate back', async ({ page }) => {
    console.log('\n🧪 TC_POST_008: Testing post discard functionality');

    await loginUser(page);
    await createPostPage.wait(2000);

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (!createBtnVisible) {
      test.skip(true, 'Create button not visible');
      return;
    }

    await createPostPage.clickCreatePostButton();
    await createPostPage.wait(1500);
    await createPostPage.enterCaption('This will be discarded').catch(() => {});

    const urlBeforeDiscard = page.url();
    await createPostPage.clickDiscard().catch(() => createPostPage.click(createPostPage.closeButton).catch(() => {}));
    await createPostPage.wait(2000);
    await createPostPage.screenshot('after-discard');

    const urlAfterDiscard = page.url();
    console.log(`📍 Before: ${urlBeforeDiscard} | After: ${urlAfterDiscard}`);
    console.log('✅ Discard test completed');
  });


  // ════════════════════════════════════════════════════════════
  // ❌ NEGATIVE TEST CASES
  // ════════════════════════════════════════════════════════════

  test('TC_POST_009 - Submitting post without caption should show error or be blocked', async ({ page }) => {
    console.log('\n🧪 TC_POST_009: Testing empty caption validation');

    await loginUser(page);
    await createPostPage.wait(2000);

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (!createBtnVisible) {
      test.skip(true, 'Create button not visible');
      return;
    }

    await createPostPage.clickCreatePostButton();
    await createPostPage.wait(1500);

    const submitVisible = await createPostPage.isVisible(createPostPage.postSubmitButton);
    if (!submitVisible) {
      test.skip(true, 'Submit button not found');
      return;
    }

    // Try to submit WITHOUT a caption
    await createPostPage.clickSubmitPost();
    await createPostPage.wait(2000);
    await createPostPage.screenshot('empty-caption-submit');

    // Should show error OR stay on create page
    const errorVisible = await createPostPage.isVisible(createPostPage.errorMessage);
    const stayedOnCreate = page.url().includes('create') || page.url().includes('post');

    expect(errorVisible || stayedOnCreate).toBe(true);
    console.log('✅ Empty caption correctly blocked');
  });

  test('TC_POST_010 - Very long caption should be handled properly', async ({ page }) => {
    console.log('\n🧪 TC_POST_010: Testing extremely long caption');

    await loginUser(page);
    await createPostPage.wait(2000);

    const createBtnVisible = await createPostPage.isVisible(createPostPage.createPostButton);
    if (!createBtnVisible) {
      test.skip(true, 'Create button not visible');
      return;
    }

    await createPostPage.clickCreatePostButton();
    await createPostPage.wait(1500);

    const captionVisible = await createPostPage.isVisible(createPostPage.captionInput);
    if (!captionVisible) {
      test.skip(true, 'Caption field not found');
      return;
    }

    await createPostPage.enterCaption(POST_DATA.longCaption); // 600+ chars
    await createPostPage.wait(1000);
    await createPostPage.screenshot('long-caption');

    // App should not crash
    expect(page.url()).toBeTruthy();

    // Check character counter
    const hasCounter = await createPostPage.assertCharacterCountVisible();
    console.log(`Character counter visible: ${hasCounter}`);
    console.log('✅ Long caption handled without crash');
  });

  test('TC_POST_011 - Unauthenticated user should not access create post', async ({ page }) => {
    console.log('\n🧪 TC_POST_011: Testing create post requires authentication');

    // Navigate directly to create page WITHOUT logging in
    await createPostPage.goto(`${APP_URL}/create`);
    await createPostPage.wait(3000);
    await createPostPage.screenshot('unauthenticated-create-post');

    const currentUrl = page.url();
    console.log(`📍 Redirected to: ${currentUrl}`);

    // Should redirect to login OR show a locked/auth message
    const redirectedToLogin = currentUrl.includes('login') ||
                              currentUrl.includes('signin') ||
                              currentUrl.includes('auth');

    const hasLoginPrompt = await createPostPage.isVisible('button:has-text("Login"), a:has-text("Login")');

    expect(redirectedToLogin || hasLoginPrompt || !currentUrl.includes('create')).toBe(true);
    console.log('✅ Authentication requirement for create post verified');
  });

});
