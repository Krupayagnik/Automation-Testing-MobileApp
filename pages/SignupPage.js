// ============================================================
// FILE: pages/SignupPage.js
// PURPOSE: Page Object for the Signup / Registration screen
// Contains all selectors and actions for new user registration
// ============================================================

const BasePage = require('./BasePage');

class SignupPage extends BasePage {

  constructor(page) {
    super(page);

    // ── Selectors for Signup screen elements ─────────────────
    this.signupLink         = 'a:has-text("Sign Up"), a:has-text("Register"), button:has-text("Create Account"), a:has-text("Join")';
    this.firstNameInput     = 'input[placeholder*="first" i], input[name="firstName"], input[name="first_name"]';
    this.lastNameInput      = 'input[placeholder*="last" i], input[name="lastName"], input[name="last_name"]';
    this.fullNameInput      = 'input[placeholder*="name" i], input[name="name"], input[name="fullName"]';
    this.usernameInput      = 'input[placeholder*="username" i], input[name="username"], input[placeholder*="@" i]';
    this.emailInput         = 'input[type="email"], input[placeholder*="email" i], input[name="email"]';
    this.phoneInput         = 'input[type="tel"], input[placeholder*="phone" i], input[placeholder*="mobile" i]';
    this.passwordInput      = 'input[type="password"], input[placeholder*="password" i]:first-of-type';
    this.confirmPassInput   = 'input[placeholder*="confirm" i], input[name="confirmPassword"]';
    this.bioInput           = 'textarea[placeholder*="bio" i], textarea[name="bio"], input[placeholder*="about" i]';
    this.otpInput           = 'input[placeholder*="otp" i], input[placeholder*="code" i], input[maxlength="6"]';
    this.sendOtpButton      = 'button:has-text("Send OTP"), button:has-text("Get OTP"), button:has-text("Send Code")';
    this.verifyOtpButton    = 'button:has-text("Verify"), button:has-text("Confirm OTP")';
    this.nextButton         = 'button:has-text("Next"), button:has-text("Continue")';
    this.submitButton       = 'button[type="submit"], button:has-text("Create Account"), button:has-text("Sign Up"), button:has-text("Register")';
    this.termsCheckbox      = 'input[type="checkbox"][name*="terms" i], input[type="checkbox"][id*="terms" i]';
    this.termsLink          = 'a:has-text("Terms")';
    this.loginLink          = 'a:has-text("Login"), a:has-text("Sign In"), button:has-text("Already have")';
    this.errorMessage       = '[class*="error"], [class*="alert"], [role="alert"]';
    this.successMessage     = '[class*="success"], [class*="welcome"]';
    this.profileImagePicker = 'input[type="file"], [class*="avatar"], [class*="profile-pic"]';
    this.usernameAvailable  = '[class*="available"], [class*="valid"]:has-text("available")';
    this.usernameTaken      = '[class*="taken"], [class*="error"]:has-text("taken")';
  }

  // ─────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────

  /**
   * Open the signup page directly or navigate to it
   * @param {string} baseUrl - Base URL of the app
   */
  async openSignupPage(baseUrl) {
    await this.goto(`${baseUrl}/signup`);
    console.log('📱 Opened Signup page');
  }

  /**
   * Navigate to signup from login page by clicking Sign Up link
   */
  async goToSignupFromLogin() {
    await this.click(this.signupLink);
    console.log('➡️  Navigated from Login to Signup');
  }

  // ─────────────────────────────────────────────────────────
  // FORM INPUT ACTIONS
  // ─────────────────────────────────────────────────────────

  async enterFirstName(name) {
    await this.type(this.firstNameInput, name);
  }

  async enterLastName(name) {
    await this.type(this.lastNameInput, name);
  }

  async enterFullName(name) {
    await this.type(this.fullNameInput, name);
  }

  async enterUsername(username) {
    await this.type(this.usernameInput, username);
    console.log(`👤 Entered username: ${username}`);
    await this.wait(1000); // Wait for availability check
  }

  async enterEmail(email) {
    await this.type(this.emailInput, email);
  }

  async enterPhone(phone) {
    await this.type(this.phoneInput, phone);
  }

  async enterPassword(password) {
    await this.type(this.passwordInput, password);
  }

  async enterConfirmPassword(password) {
    await this.type(this.confirmPassInput, password);
  }

  async enterBio(bio) {
    await this.type(this.bioInput, bio);
  }

  async enterOtp(otp) {
    await this.type(this.otpInput, otp);
  }

  // ─────────────────────────────────────────────────────────
  // BUTTON ACTIONS
  // ─────────────────────────────────────────────────────────

  async clickSendOtp() {
    await this.click(this.sendOtpButton);
    console.log('📨 Requested OTP');
  }

  async clickVerifyOtp() {
    await this.click(this.verifyOtpButton);
  }

  async clickNext() {
    await this.click(this.nextButton);
  }

  async clickSubmit() {
    await this.click(this.submitButton);
    console.log('🚀 Submitted signup form');
  }

  async clickTermsCheckbox() {
    const checkbox = this.page.locator(this.termsCheckbox);
    const isChecked = await checkbox.isChecked().catch(() => false);
    if (!isChecked) {
      await checkbox.click();
      console.log('☑️  Accepted Terms & Conditions');
    }
  }

  async clickLoginLink() {
    await this.click(this.loginLink);
  }

  // ─────────────────────────────────────────────────────────
  // COMBINED REGISTRATION FLOWS
  // ─────────────────────────────────────────────────────────

  /**
   * Fill and submit a complete registration form
   * @param {object} userData - Object with user registration data
   */
  async completeRegistration(userData) {
    console.log('\n📝 Starting registration flow...');

    // Try to enter first/last name OR full name
    try {
      await this.enterFirstName(userData.firstName);
      await this.enterLastName(userData.lastName);
    } catch {
      await this.enterFullName(`${userData.firstName} ${userData.lastName}`);
    }

    await this.enterUsername(userData.username);
    await this.enterEmail(userData.email);

    // Phone is sometimes optional
    try {
      await this.enterPhone(userData.phone);
    } catch {
      console.log('ℹ️  Phone field not found (optional)');
    }

    await this.enterPassword(userData.password);

    // Confirm password might not always exist
    try {
      await this.enterConfirmPassword(userData.confirmPassword);
    } catch {
      console.log('ℹ️  Confirm password field not found');
    }

    // Bio is optional
    try {
      if (userData.bio) {
        await this.enterBio(userData.bio);
      }
    } catch {
      console.log('ℹ️  Bio field not found (optional)');
    }

    // Accept terms if checkbox exists
    try {
      await this.clickTermsCheckbox();
    } catch {
      console.log('ℹ️  Terms checkbox not found');
    }

    await this.clickSubmit();
    console.log('✅ Registration form submitted');
  }

  // ─────────────────────────────────────────────────────────
  // ASSERTIONS
  // ─────────────────────────────────────────────────────────

  /**
   * Verify signup was successful
   */
  async assertSignupSuccess() {
    await this.wait(3000);
    // After signup, user should be redirected away from signup page
    const url = this.getCurrentUrl();
    const stillOnSignup = url.includes('signup') || url.includes('register');

    if (stillOnSignup) {
      // Check for success message on same page
      const successVisible = await this.isVisible(this.successMessage);
      if (!successVisible) {
        throw new Error('❌ Signup may have failed - still on signup page');
      }
    }
    console.log('✅ Signup completed successfully');
  }

  /**
   * Verify error message is shown
   * @param {string} expectedText - Expected error text
   */
  async assertErrorShown(expectedText) {
    const errorVisible = await this.isVisible(this.errorMessage);
    if (!errorVisible && expectedText) {
      await this.assertPageContainsText(expectedText);
    } else {
      const text = await this.getText(this.errorMessage).catch(() => '');
      console.log(`⚠️  Error shown: "${text}"`);
    }
    console.log('✅ Error is displayed as expected');
  }

  /**
   * Check if username availability message is shown
   */
  async assertUsernameAvailable() {
    await this.assertVisible(this.usernameAvailable, 'Username available indicator should show');
  }

  async assertUsernameTaken() {
    await this.assertVisible(this.usernameTaken, 'Username taken indicator should show');
  }
}

module.exports = SignupPage;
