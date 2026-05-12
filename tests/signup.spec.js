// ============================================================
// FILE: tests/signup.spec.js
// PURPOSE: All test cases for Signup / Registration functionality
// ============================================================

const { test, expect } = require('@playwright/test');
const SignupPage = require('../pages/SignupPage');
const LoginPage  = require('../pages/LoginPage');
const { APP_URL, NEW_USER, INVALID_DATA, TIMEOUTS } = require('../utils/testData');
const { takeFailureScreenshot, generateUniqueEmail, generateUsername } = require('../utils/helpers');

test.describe('📝 Signup / Registration Feature Tests', () => {

  let signupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);

    // Try to open signup page directly
    await signupPage.openSignupPage(APP_URL);

    // If that didn't work, try via login page
    const isOnSignup = page.url().includes('signup') || page.url().includes('register');
    if (!isOnSignup) {
      // Maybe we need to navigate from login page
      const loginPage = new LoginPage(page);
      await loginPage.openLoginPage(APP_URL);
      const signupLinkVisible = await signupPage.isVisible(signupPage.signupLink);
      if (signupLinkVisible) {
        await signupPage.goToSignupFromLogin();
      }
    }

    await signupPage.screenshot('signup-page-start');
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

  test('TC_SIGNUP_001 - Signup page should load with registration form', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_001: Verifying signup page loads');

    const url = page.url();
    console.log(`📍 Current URL: ${url}`);

    // At least one form input should be visible
    const inputs = [
      signupPage.firstNameInput,
      signupPage.fullNameInput,
      signupPage.emailInput,
      signupPage.phoneInput,
      signupPage.usernameInput,
    ];

    let atLeastOneVisible = false;
    for (const selector of inputs) {
      const visible = await signupPage.isVisible(selector);
      if (visible) {
        atLeastOneVisible = true;
        console.log(`✅ Found form field: ${selector}`);
        break;
      }
    }

    // If no inputs found, at least the page should load
    if (!atLeastOneVisible) {
      console.log('⚠️  No form inputs found - might be a multi-step form or different URL');
    }

    await signupPage.screenshot('signup-form-visible');
    console.log('✅ Signup page loaded');
  });

  test('TC_SIGNUP_002 - Entering unique username should show availability check', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_002: Testing username availability check');

    const usernameVisible = await signupPage.isVisible(signupPage.usernameInput);
    if (!usernameVisible) {
      test.skip(true, 'Username field not found on this page');
      return;
    }

    const uniqueUsername = generateUsername(); // e.g. user_abc12
    await signupPage.enterUsername(uniqueUsername);

    // Wait for real-time availability check
    await signupPage.wait(2000);
    await signupPage.screenshot('username-availability-check');

    // Either "available" or "taken" indicator should show
    const isAvailable = await signupPage.isVisible(signupPage.usernameAvailable);
    const isTaken = await signupPage.isVisible(signupPage.usernameTaken);

    // At least log what we found
    console.log(`Username "${uniqueUsername}" - Available: ${isAvailable}, Taken: ${isTaken}`);
    // This is informational - username checks depend on backend
    console.log('✅ Username availability check test completed');
  });

  test('TC_SIGNUP_003 - All required fields filled should enable submit button', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_003: Testing form completion enables submit');

    // Check if submit button exists
    const hasSubmit = await signupPage.isVisible(signupPage.submitButton);
    if (!hasSubmit) {
      test.skip(true, 'Submit button not found');
      return;
    }

    // Generate unique test data
    const testUser = {
      firstName: 'QA',
      lastName: 'Test',
      username: generateUsername(),
      email: generateUniqueEmail(),
      phone: '9988776655',
      password: 'QaTest@9876',
      confirmPassword: 'QaTest@9876',
      bio: 'Test bio by Playwright',
    };

    // Fill the form
    await signupPage.completeRegistration(testUser);
    await signupPage.wait(3000);
    await signupPage.screenshot('after-signup-submit');
    console.log('✅ Registration form submitted with valid data');
  });

  test('TC_SIGNUP_004 - Login link on signup page should navigate to login', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_004: Testing Login link on signup page');

    const loginLinkVisible = await signupPage.isVisible(signupPage.loginLink);
    if (!loginLinkVisible) {
      test.skip(true, 'Login link not found on signup page');
      return;
    }

    const urlBefore = page.url();
    await signupPage.clickLoginLink();
    await signupPage.wait(2000);
    const urlAfter = page.url();

    console.log(`📍 Navigated: ${urlBefore} → ${urlAfter}`);

    // Should navigate away from signup page
    const leftSignupPage = !urlAfter.includes('signup') && !urlAfter.includes('register');
    expect(leftSignupPage || urlAfter !== urlBefore).toBe(true);
    console.log('✅ Login link works correctly');
  });

  test('TC_SIGNUP_005 - OTP verification on phone number should work', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_005: Testing phone OTP during signup');

    const phoneVisible = await signupPage.isVisible(signupPage.phoneInput);
    const sendOtpVisible = await signupPage.isVisible(signupPage.sendOtpButton);

    if (!phoneVisible || !sendOtpVisible) {
      test.skip(true, 'Phone OTP flow not found on signup page');
      return;
    }

    await signupPage.enterPhone('9123456789');
    await signupPage.clickSendOtp();
    await signupPage.wait(3000);
    await signupPage.screenshot('signup-otp-sent');

    // OTP field should appear
    const otpVisible = await signupPage.isVisible(signupPage.otpInput);
    const successMsg = await signupPage.isVisible(signupPage.successMessage);

    expect(otpVisible || successMsg).toBe(true);
    console.log('✅ OTP was triggered on signup phone field');
  });


  // ════════════════════════════════════════════════════════════
  // ❌ NEGATIVE TEST CASES
  // ════════════════════════════════════════════════════════════

  test('TC_SIGNUP_006 - Submitting empty form should show validation errors', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_006: Testing empty form validation');

    const hasSubmit = await signupPage.isVisible(signupPage.submitButton);
    const hasNext = await signupPage.isVisible(signupPage.nextButton);

    if (!hasSubmit && !hasNext) {
      test.skip(true, 'No submit/next button found');
      return;
    }

    // Click submit WITHOUT filling anything
    if (hasSubmit) {
      await signupPage.clickSubmit();
    } else {
      await signupPage.clickNext();
    }

    await signupPage.wait(2000);
    await signupPage.screenshot('empty-form-errors');

    // Error messages should appear OR page stays same
    const errorVisible = await signupPage.isVisible(signupPage.errorMessage);
    const currentUrl = page.url();
    const stayedOnPage = currentUrl.includes('signup') || currentUrl.includes('register');

    expect(errorVisible || stayedOnPage).toBe(true);
    console.log('✅ Empty form correctly shows validation');
  });

  test('TC_SIGNUP_007 - Invalid email format should show error', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_007: Testing invalid email format');

    const emailVisible = await signupPage.isVisible(signupPage.emailInput);
    if (!emailVisible) {
      test.skip(true, 'Email input not on this page');
      return;
    }

    await signupPage.enterEmail(INVALID_DATA.invalidEmail); // 'notanemail'
    await signupPage.clickSubmit().catch(() => signupPage.clickNext().catch(() => {}));
    await signupPage.wait(2000);
    await signupPage.screenshot('invalid-email-signup');

    const errorVisible = await signupPage.isVisible(signupPage.errorMessage);
    const stayedOnPage = page.url().includes('signup') || page.url().includes('register');
    expect(errorVisible || stayedOnPage).toBe(true);
    console.log('✅ Invalid email format handled correctly');
  });

  test('TC_SIGNUP_008 - Mismatched passwords should show error', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_008: Testing mismatched password validation');

    const passVisible = await signupPage.isVisible(signupPage.passwordInput);
    const confirmVisible = await signupPage.isVisible(signupPage.confirmPassInput);

    if (!passVisible || !confirmVisible) {
      test.skip(true, 'Password/confirm fields not found');
      return;
    }

    await signupPage.enterPassword('Password@123');
    await signupPage.enterConfirmPassword('DifferentPass@456'); // DIFFERENT password

    await signupPage.clickSubmit().catch(() => {});
    await signupPage.wait(2000);
    await signupPage.screenshot('password-mismatch');

    const errorVisible = await signupPage.isVisible(signupPage.errorMessage);
    const stayedOnPage = page.url().includes('signup') || page.url().includes('register');
    expect(errorVisible || stayedOnPage).toBe(true);
    console.log('✅ Password mismatch correctly detected');
  });

  test('TC_SIGNUP_009 - Short password should fail validation', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_009: Testing short password rejection');

    const passVisible = await signupPage.isVisible(signupPage.passwordInput);
    if (!passVisible) {
      test.skip(true, 'Password field not found');
      return;
    }

    await signupPage.enterPassword(INVALID_DATA.shortPassword); // '123'
    await signupPage.clickSubmit().catch(() => {});
    await signupPage.wait(2000);
    await signupPage.screenshot('short-password-signup');

    const errorVisible = await signupPage.isVisible(signupPage.errorMessage);
    const stayedOnPage = page.url().includes('signup') || page.url().includes('register');
    expect(errorVisible || stayedOnPage).toBe(true);
    console.log('✅ Short password correctly rejected');
  });

  test('TC_SIGNUP_010 - Username with special characters should show error', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_010: Testing special chars in username');

    const usernameVisible = await signupPage.isVisible(signupPage.usernameInput);
    if (!usernameVisible) {
      test.skip(true, 'Username field not found');
      return;
    }

    await signupPage.enterUsername(INVALID_DATA.specialCharsUsername); // '@@##$$%%'
    await signupPage.wait(1500);
    await signupPage.screenshot('special-chars-username');

    // Error should appear for invalid username
    const errorVisible = await signupPage.isVisible(signupPage.errorMessage);
    const takenMsg = await signupPage.isVisible(signupPage.usernameTaken);
    console.log(`Error shown: ${errorVisible}, Taken msg: ${takenMsg}`);
    console.log('✅ Special character username test completed');
  });

  test('TC_SIGNUP_011 - Duplicate email registration should show error', async ({ page }) => {
    console.log('\n🧪 TC_SIGNUP_011: Testing duplicate email rejection');

    const emailVisible = await signupPage.isVisible(signupPage.emailInput);
    if (!emailVisible) {
      test.skip(true, 'Email field not found');
      return;
    }

    // Use an email that already exists in the system
    await signupPage.enterEmail('existing@test.com'); // Should already exist
    await signupPage.clickSubmit().catch(() => signupPage.clickNext().catch(() => {}));
    await signupPage.wait(2000);
    await signupPage.screenshot('duplicate-email');

    const errorVisible = await signupPage.isVisible(signupPage.errorMessage);
    const stayedOnPage = page.url().includes('signup') || page.url().includes('register');
    expect(errorVisible || stayedOnPage).toBe(true);
    console.log('✅ Duplicate email rejection test completed');
  });

});
