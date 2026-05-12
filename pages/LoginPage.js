const BasePage = require('./BasePage');

class LoginPage extends BasePage {

  constructor(page) {
    super(page); // Call parent constructor 

    // ── Locators 
    this.phoneInput        = 'input[type="tel"], input[placeholder*="phone" i], input[placeholder*="mobile" i], input[name="phone"]';
    this.emailInput        = 'input[type="email"], input[placeholder*="email" i], input[name="email"]';
    this.passwordInput     = 'input[type="password"], input[placeholder*="password" i]';
    this.otpInput          = 'input[placeholder*="otp" i], input[placeholder*="code" i], input[maxlength="6"]';
    this.loginButton       = 'button[type="submit"], button:has-text("Login"), button:has-text("Sign In"), button:has-text("Continue")';
    this.sendOtpButton     = 'button:has-text("Send OTP"), button:has-text("Get OTP"), button:has-text("Send Code")';
    this.verifyOtpButton   = 'button:has-text("Verify"), button:has-text("Submit"), button:has-text("Confirm")';
    this.forgotPasswordLink= 'a:has-text("Forgot"), button:has-text("Forgot")';
    this.signupLink        = 'a:has-text("Sign Up"), a:has-text("Register"), button:has-text("Create Account")';
    this.errorMessage      = '[class*="error"], [class*="alert"], [role="alert"], [class*="invalid"]';
    this.successMessage    = '[class*="success"], [class*="toast"], [role="status"]';
    this.logoutButton      = 'button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")';
    this.homeIndicator     = '[class*="home"], [class*="dashboard"], [class*="feed"]'; // Element shown after login
  }

  // NAVIGATION
 
  async openLoginPage(baseUrl) {
    await this.goto(baseUrl);
    console.log(' Opened app home page');
  }

  // ACTIONS

  /**
   * Enter phone number in the phone input field
   */
  async enterPhone(phone) {
    await this.type(this.phoneInput, phone);
    console.log(` Entered phone: ${phone}`);
  }

  /**
   * Enter email address
   */
  async enterEmail(email) {
    await this.type(this.emailInput, email);
    console.log(` Entered email: ${email}`);
  }

  /**
   * Enter password
   */
  async enterPassword(password) {
    await this.type(this.passwordInput, password);
    console.log(' Entered password');
  }

  /**
   * Enter OTP code
   */
  async enterOtp(otp) {
    await this.type(this.otpInput, otp);
    console.log(` Entered OTP: ${otp}`);
  }

  /**
   * Click the "Send OTP" button
   */
  async clickSendOtp() {
    await this.click(this.sendOtpButton);
    console.log(' Clicked Send OTP');
  }

  /**
   * Click the "Verify OTP" button
   */
  async clickVerifyOtp() {
    await this.click(this.verifyOtpButton);
    console.log(' Clicked Verify OTP');
  }

  /**
   * Click the main Login button
   */
  async clickLogin() {
    await this.click(this.loginButton);
    console.log(' Clicked Login button');
  }

  /**
   * Click "Forgot Password" link
   */
  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Click "Sign Up" link to go to registration
   */
  async clickSignupLink() {
    await this.click(this.signupLink);
  }

  /**
   * Click Logout button
   */
  async clickLogout() {
    await this.click(this.logoutButton);
    console.log(' Clicked Logout');
  }

  // COMBINED FLOWS 
  /**
   * Complete login with phone + OTP flow
   */
  async loginWithPhoneOtp(phone, otp) {
    await this.enterPhone(phone);
    await this.clickSendOtp();
    await this.wait(2000); // Wait for OTP to send
    await this.enterOtp(otp);
    await this.clickVerifyOtp();
    console.log(' Completed Phone+OTP login flow');
  }

  /**
   * Complete login with email + password flow
   */
  async loginWithEmailPassword(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickLogin();
    console.log('Completed Email+Password login flow');
  }

  // ASSERTIONS (verificatio)

  /**
   * Verify that login was successful
   */
  async assertLoginSuccess() {
    await this.wait(2000);
    const currentUrl = this.getCurrentUrl();
    console.log(` Current URL after login: ${currentUrl}`);

    const isOnLoginPage = currentUrl.includes('login') || currentUrl.includes('signin');
    if (isOnLoginPage) {
      const homeVisible = await this.isVisible(this.homeIndicator);
      if (!homeVisible) {
        throw new Error(' Login failed - still on login page or no home indicator found');
      }
    }
    console.log(' Login successful - user is on home/dashboard');
  }

  /**
   * Verify error message is shown
   */
  async assertErrorShown(expectedText) {
    const errorVisible = await this.isVisible(this.errorMessage);
    if (!errorVisible && expectedText) {
      await this.assertPageContainsText(expectedText);
    } else if (errorVisible) {
      const errorText = await this.getText(this.errorMessage);
      console.log(` Error shown: "${errorText}"`);
      if (expectedText) {
        const hasExpected = errorText.toLowerCase().includes(expectedText.toLowerCase());
        if (!hasExpected) {
          throw new Error(`Expected error "${expectedText}" but got "${errorText}"`);
        }
      }
    }
    console.log(' Error message is displayed as expected');
  }

  /**
   * Check if OTP input field is visible (after sending OTP)
   */
  async assertOtpFieldVisible() {
    await this.assertVisible(this.otpInput, 'OTP input field should appear after sending OTP');
    console.log(' OTP input field is visible');
  }
}

// Export so test files can use it
module.exports = LoginPage;
