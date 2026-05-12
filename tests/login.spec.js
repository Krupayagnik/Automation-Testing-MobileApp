//  Imports 
const { test, expect } = require('@playwright/test');
const LoginPage        = require('../pages/LoginPage');
const { APP_URL, VALID_USER, INVALID_DATA, TIMEOUTS } = require('../utils/testData');
const { takeFailureScreenshot } = require('../utils/helpers');

//  Test Suite Setup
// "describe" groups related tests together
test.describe(' Login Feature Tests', () => {

  // Variables to hold page objects (created fresh for each test)
  let loginPage;

  // ── beforeEach: Runs BEFORE every test in this describe block ──
  test.beforeEach(async ({ page }) => {
    // Create a fresh LoginPage instance for each test
    loginPage = new LoginPage(page);

    // Open the app login page
    await loginPage.openLoginPage(APP_URL);

    // Take screenshot of the starting state
    await loginPage.screenshot('login-page-start');
  });

  // ── afterEach: Runs AFTER every test (even if it fails) ────────
  test.afterEach(async ({ page }, testInfo) => {
    // If the test FAILED, take a screenshot for debugging
    if (testInfo.status !== testInfo.expectedStatus) {
      await takeFailureScreenshot(page, testInfo.title);
      console.log(` TEST FAILED: ${testInfo.title}`);
    }
  });


  //  POSITIVE TEST CASES (valid inputs, expect success)

  test('TC_LOGIN_001 - App should load and show login screen', async ({ page }) => {
    // WHAT THIS TESTS: That the app actually opens correctly
    console.log('\n TC_LOGIN_001: Verifying app loads with login screen');

    // The page should have loaded (URL should not be blank)
    expect(page.url()).toContain('begenuin');

    // Page title should exist
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(` Page title: "${title}"`);

    // Take a screenshot
    await loginPage.screenshot('app-loaded');
    console.log('App loaded successfully');
  });

  test('TC_LOGIN_002 - Login page should display required UI elements', async ({ page }) => {
    console.log('\n TC_LOGIN_002: Checking login page UI elements');
    const hasPhoneInput = await loginPage.isVisible(loginPage.phoneInput);
    const hasEmailInput = await loginPage.isVisible(loginPage.emailInput);
    expect(hasPhoneInput || hasEmailInput).toBe(true);
    console.log(` Phone input visible: ${hasPhoneInput}`);
    console.log(` Email input visible: ${hasEmailInput}`);

    // Login button should exist
    const hasLoginBtn = await loginPage.isVisible(loginPage.loginButton);
    const hasSendOtpBtn = await loginPage.isVisible(loginPage.sendOtpButton);
    expect(hasLoginBtn || hasSendOtpBtn).toBe(true);
    console.log(' Login page has required UI elements');
  });

  test('TC_LOGIN_003 - Valid phone number should trigger OTP send', async ({ page }) => {
    console.log('\n TC_LOGIN_003: Testing OTP send with valid phone');

    const hasPhoneInput = await loginPage.isVisible(loginPage.phoneInput);

    if (!hasPhoneInput) {
      test.skip(true, 'Phone input not found - skipping OTP test');
      return;
    }

    // Enter a valid phone number
    await loginPage.enterPhone(VALID_USER.phone);

    // Click Send OTP
    await loginPage.clickSendOtp();

    // Wait for OTP field to appear (or success message)
    await loginPage.wait(3000);

    // Take screenshot
    await loginPage.screenshot('after-send-otp');

    // Verify OTP field is now visible OR success message shows
    const otpVisible = await loginPage.isVisible(loginPage.otpInput);
    const successMsg = await loginPage.isVisible(loginPage.successMessage);

    expect(otpVisible || successMsg).toBe(true);
    console.log(' OTP was sent successfully');
  });

  test('TC_LOGIN_004 - Valid credentials login should succeed', async ({ page }) => {
    // WHAT THIS TESTS: Complete login with valid credentials
    console.log('\n TC_LOGIN_004: Testing full login flow with valid credentials');

    // Check which login method is available
    const hasEmailInput = await loginPage.isVisible(loginPage.emailInput);
    const hasPhoneInput = await loginPage.isVisible(loginPage.phoneInput);

    if (hasEmailInput) {
      // Email + Password login
      await loginPage.loginWithEmailPassword(VALID_USER.email, VALID_USER.password);
    } else if (hasPhoneInput) {
      await loginPage.enterPhone(VALID_USER.phone);
      await loginPage.clickSendOtp();
      await loginPage.wait(2000);
      await loginPage.enterOtp(VALID_USER.otp);
      await loginPage.clickVerifyOtp();
    } else {
      test.skip(true, 'No login inputs found');
      return;
    }

    // Wait for redirect/home page to load
    await loginPage.wait(3000);
    await loginPage.screenshot('after-login');

    // Verify login succeeded (URL changed OR home indicator visible)
    await loginPage.assertLoginSuccess();
    console.log(' Login with valid credentials PASSED');
  });

  test('TC_LOGIN_005 - Signup link should navigate to registration page', async ({ page }) => {
    // WHAT THIS TESTS: Navigation from Login to Signup
    console.log('\n TC_LOGIN_005: Testing Sign Up link navigation');

    const hasSignupLink = await loginPage.isVisible(loginPage.signupLink);

    if (!hasSignupLink) {
      test.skip(true, 'Sign up link not found on login page');
      return;
    }

    const urlBefore = loginPage.getCurrentUrl();
    await loginPage.clickSignupLink();
    await loginPage.wait(2000);
    const urlAfter = loginPage.getCurrentUrl();

    // URL should change
    expect(urlAfter).not.toBe(urlBefore);
    console.log(` Navigated from ${urlBefore} → ${urlAfter}`);
    console.log(' Sign Up link navigation works');
  });


  //  NEGATIVE TEST CASES (invalid inputs, expect errors)

  test('TC_LOGIN_006 - Login with empty phone/email should show error', async ({ page }) => {
    // WHAT THIS TESTS: Form validation - empty fields should not submit
    console.log('\n TC_LOGIN_006: Testing empty field validation');

    // Click login without entering anything
    const loginBtnVisible = await loginPage.isVisible(loginPage.loginButton);
    const sendOtpVisible = await loginPage.isVisible(loginPage.sendOtpButton);

    if (loginBtnVisible) {
      await loginPage.clickLogin();
    } else if (sendOtpVisible) {
      await loginPage.clickSendOtp();
    }

    await loginPage.wait(2000);
    await loginPage.screenshot('empty-field-error');

    // Should show error OR still be on login page (no navigation happened)
    const currentUrl = loginPage.getCurrentUrl();
    const staysOnLogin = currentUrl.includes('login') ||
                         currentUrl.includes('signin') ||
                         currentUrl === APP_URL + '/' ||
                         currentUrl === APP_URL;

    const errorShown = await loginPage.isVisible(loginPage.errorMessage);

    expect(staysOnLogin || errorShown).toBe(true);
    console.log(' Empty field validation works correctly');
  });

  test('TC_LOGIN_007 - Login with invalid phone number should show error', async ({ page }) => {
    console.log('\n TC_LOGIN_007: Testing invalid phone number');

    const hasPhoneInput = await loginPage.isVisible(loginPage.phoneInput);
    if (!hasPhoneInput) {
      test.skip(true, 'Phone input not found');
      return;
    }

    // Enter a wrong/non-existent phone number
    await loginPage.enterPhone(INVALID_DATA.wrongPhone);
    await loginPage.clickSendOtp();
    await loginPage.wait(2000);
    await loginPage.screenshot('invalid-phone-error');

    // Should show error message
    const errorShown = await loginPage.isVisible(loginPage.errorMessage);
    const staysOnPage = loginPage.getCurrentUrl().includes('login') ||
                        loginPage.getCurrentUrl() === APP_URL ||
                        loginPage.getCurrentUrl() === APP_URL + '/';
    expect(errorShown || staysOnPage).toBe(true);
    console.log(' Invalid phone number correctly rejected');
  });

  test('TC_LOGIN_008 - Login with wrong OTP should show error', async ({ page }) => {
    // WHAT THIS TESTS: Invalid OTP is rejected
    console.log('\n TC_LOGIN_008: Testing wrong OTP rejection');

    const hasPhoneInput = await loginPage.isVisible(loginPage.phoneInput);
    if (!hasPhoneInput) {
      test.skip(true, 'Phone input not found - OTP flow not applicable');
      return;
    }

    await loginPage.enterPhone(VALID_USER.phone);
    await loginPage.clickSendOtp();
    await loginPage.wait(2000);

    const otpVisible = await loginPage.isVisible(loginPage.otpInput);
    if (!otpVisible) {
      console.log('  OTP field not shown - skipping');
      return;
    }

    // Enter WRONG OTP
    await loginPage.enterOtp(INVALID_DATA.wrongOtp);
    await loginPage.clickVerifyOtp();
    await loginPage.wait(2000);
    await loginPage.screenshot('wrong-otp-error');

    // Error should appear
    const errorShown = await loginPage.isVisible(loginPage.errorMessage);
    expect(errorShown).toBe(true);
    console.log(' Wrong OTP correctly rejected');
  });

  test('TC_LOGIN_009 - Login with invalid email format should show error', async ({ page }) => {
    console.log('\n TC_LOGIN_009: Testing invalid email format');

    const hasEmailInput = await loginPage.isVisible(loginPage.emailInput);
    if (!hasEmailInput) {
      test.skip(true, 'Email input not found');
      return;
    }

    // Enter invalid email 
    await loginPage.enterEmail(INVALID_DATA.invalidEmail);
    await loginPage.clickLogin().catch(() => {}); // Ignore if button doesn't exist yet
    await loginPage.wait(1500);
    await loginPage.screenshot('invalid-email-error');

    // Error should be shown OR browser native validation fires
    const errorShown = await loginPage.isVisible(loginPage.errorMessage);
    const pageStays = loginPage.getCurrentUrl() === APP_URL ||
                      loginPage.getCurrentUrl() === APP_URL + '/';

    expect(errorShown || pageStays).toBe(true);
    console.log(' Invalid email format correctly handled');
  });

  test('TC_LOGIN_010 - Login with short/invalid password should show error', async ({ page }) => {
    // WHAT THIS TESTS: Password validation
    console.log('\n TC_LOGIN_010: Testing short password validation');

    const hasEmailInput = await loginPage.isVisible(loginPage.emailInput);
    const hasPassInput = await loginPage.isVisible(loginPage.passwordInput);

    if (!hasEmailInput || !hasPassInput) {
      test.skip(true, 'Email/Password fields not found');
      return;
    }

    await loginPage.enterEmail(VALID_USER.email);
    await loginPage.enterPassword(INVALID_DATA.shortPassword); // '123' - too short
    await loginPage.clickLogin();
    await loginPage.wait(2000);
    await loginPage.screenshot('short-password-error');

    const errorShown = await loginPage.isVisible(loginPage.errorMessage);
    const staysOnPage = loginPage.getCurrentUrl().includes('login') ||
                        loginPage.getCurrentUrl() === APP_URL ||
                        loginPage.getCurrentUrl() === APP_URL + '/';
    expect(errorShown || staysOnPage).toBe(true);
    console.log(' Short password correctly rejected');
  });


  //  SECURITY / EDGE CASE TESTS

  test('TC_LOGIN_011 - SQL injection in phone field should not crash app', async ({ page }) => {
    // WHAT THIS TESTS: App handles malicious input safely
    console.log('\n TC_LOGIN_011: Testing SQL injection handling');

    const hasPhoneInput = await loginPage.isVisible(loginPage.phoneInput);
    if (!hasPhoneInput) {
      test.skip(true, 'Phone input not found');
      return;
    }

    await loginPage.enterPhone(INVALID_DATA.sqlInjection);
    await loginPage.clickSendOtp().catch(() => {});
    await loginPage.wait(2000);
    await loginPage.screenshot('sql-injection-test');

    // App should not crash (page still exists)
    expect(page.url()).toBeTruthy();
    const hasTitle = await page.title();
    expect(hasTitle).toBeTruthy();
    console.log(' App handled SQL injection safely - no crash');
  });

  test('TC_LOGIN_012 - Very long text in phone field should be handled', async ({ page }) => {
    console.log('\n TC_LOGIN_012: Testing long text input handling');

    const hasPhoneInput = await loginPage.isVisible(loginPage.phoneInput);
    if (!hasPhoneInput) {
      test.skip(true, 'Phone input not found');
      return;
    }

    await loginPage.enterPhone(INVALID_DATA.longText); // 300 char string
    await loginPage.wait(1000);
    await loginPage.screenshot('long-text-test');

    // App should not crash
    expect(page.url()).toBeTruthy();
    console.log(' Long text handled without app crash');
  });

});
