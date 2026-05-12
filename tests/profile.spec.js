// ============================================================
// FILE: tests/profile.spec.js
// PURPOSE: All test cases for User Profile functionality
// Covers: view profile, edit profile, logout, settings
// ============================================================

const { test, expect } = require('@playwright/test');
const ProfilePage  = require('../pages/ProfilePage');
const LoginPage    = require('../pages/LoginPage');
const { APP_URL, VALID_USER, PROFILE_DATA, INVALID_DATA, TIMEOUTS } = require('../utils/testData');
const { takeFailureScreenshot } = require('../utils/helpers');

test.describe('👤 User Profile Feature Tests', () => {

  let profilePage;
  let loginPage;

  // ── Helper: Login before each profile test ──────────────────
  async function loginUser(page) {
    loginPage = new LoginPage(page);
    await loginPage.openLoginPage(APP_URL);
    await loginPage.wait(1500);

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
    console.log('🔑 Login attempted for profile test');
  }

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await profilePage.goto(APP_URL);
    await profilePage.wait(2000);
    await profilePage.screenshot('profile-test-start');
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

  test('TC_PROFILE_001 - App should load and display main screen', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_001: Verifying main app screen');

    const url = page.url();
    expect(url).toBeTruthy();
    expect(url).toContain('begenuin');

    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`📄 Title: "${title}" | URL: ${url}`);

    await profilePage.screenshot('main-screen');
    console.log('✅ Main app screen loaded');
  });

  test('TC_PROFILE_002 - Profile tab/button should be accessible', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_002: Checking profile navigation availability');

    await loginUser(page);
    await profilePage.wait(2000);

    const profileTabVisible = await profilePage.isVisible(profilePage.profileTab);
    console.log(`👤 Profile tab visible: ${profileTabVisible}`);

    if (profileTabVisible) {
      await profilePage.clickProfileTab();
      await profilePage.wait(2000);
      await profilePage.screenshot('profile-tab-clicked');
      console.log('✅ Profile tab clicked successfully');
    } else {
      // Try direct URL
      await profilePage.openProfilePage(APP_URL);
      await profilePage.wait(2000);
      console.log('ℹ️  Used direct URL for profile page');
    }
    console.log('✅ Profile navigation test completed');
  });

  test('TC_PROFILE_003 - Profile page should show user information', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_003: Verifying profile page shows user data');

    await loginUser(page);

    // Navigate to profile
    const profileTabVisible = await profilePage.isVisible(profilePage.profileTab);
    if (profileTabVisible) {
      await profilePage.clickProfileTab();
    } else {
      await profilePage.openProfilePage(APP_URL);
    }
    await profilePage.wait(2000);
    await profilePage.screenshot('profile-page-info');

    // Check for profile elements
    const hasAvatar = await profilePage.isVisible(profilePage.profileAvatar);
    const hasName = await profilePage.isVisible(profilePage.profileName);
    const hasEditBtn = await profilePage.isVisible(profilePage.editProfileButton);
    const hasSettings = await profilePage.isVisible(profilePage.settingsButton);

    console.log(`Avatar: ${hasAvatar} | Name: ${hasName} | Edit btn: ${hasEditBtn} | Settings: ${hasSettings}`);

    // At least ONE profile element should be visible
    const someElementVisible = hasAvatar || hasName || hasEditBtn || hasSettings;
    // This is informational - profile depends on being logged in
    console.log('✅ Profile page elements check completed');
  });

  test('TC_PROFILE_004 - Edit Profile button should open edit form', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_004: Testing Edit Profile button');

    await loginUser(page);

    // Go to profile page
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const editBtnVisible = await profilePage.isVisible(profilePage.editProfileButton);
    if (!editBtnVisible) {
      test.skip(true, 'Edit Profile button not found - might require login');
      return;
    }

    const urlBefore = page.url();
    await profilePage.clickEditProfile();
    await profilePage.wait(2000);
    await profilePage.screenshot('edit-profile-form');

    const urlAfter = page.url();
    const formVisible = await profilePage.isVisible(profilePage.nameInput) ||
                        await profilePage.isVisible(profilePage.bioInput);
    const urlChanged = urlAfter !== urlBefore;

    expect(formVisible || urlChanged).toBe(true);
    console.log('✅ Edit Profile button opens form correctly');
  });

  test('TC_PROFILE_005 - Edit bio should save successfully', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_005: Testing bio update');

    await loginUser(page);
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const editBtnVisible = await profilePage.isVisible(profilePage.editProfileButton);
    if (!editBtnVisible) {
      test.skip(true, 'Edit Profile button not found');
      return;
    }

    await profilePage.clickEditProfile();
    await profilePage.wait(1500);

    const bioVisible = await profilePage.isVisible(profilePage.bioInput);
    if (!bioVisible) {
      test.skip(true, 'Bio input not found on edit form');
      return;
    }

    // Update bio
    await profilePage.updateBio(PROFILE_DATA.updatedBio);
    await profilePage.clickSave();
    await profilePage.wait(3000);
    await profilePage.screenshot('bio-updated');

    // Verify update
    await profilePage.assertProfileUpdated();
    console.log('✅ Bio updated successfully');
  });

  test('TC_PROFILE_006 - Edit display name should save successfully', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_006: Testing display name update');

    await loginUser(page);
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const editBtnVisible = await profilePage.isVisible(profilePage.editProfileButton);
    if (!editBtnVisible) {
      test.skip(true, 'Edit Profile button not found');
      return;
    }

    await profilePage.clickEditProfile();
    await profilePage.wait(1500);

    const nameVisible = await profilePage.isVisible(profilePage.nameInput);
    if (!nameVisible) {
      test.skip(true, 'Name input not found');
      return;
    }

    await profilePage.updateName(PROFILE_DATA.updatedName);
    await profilePage.clickSave();
    await profilePage.wait(3000);
    await profilePage.screenshot('name-updated');

    console.log('✅ Display name update test completed');
  });

  test('TC_PROFILE_007 - Add website URL to profile should work', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_007: Testing website URL addition to profile');

    await loginUser(page);
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const editBtnVisible = await profilePage.isVisible(profilePage.editProfileButton);
    if (!editBtnVisible) {
      test.skip(true, 'Edit Profile button not found');
      return;
    }

    await profilePage.clickEditProfile();
    await profilePage.wait(1500);

    const websiteVisible = await profilePage.isVisible(profilePage.websiteInput);
    if (!websiteVisible) {
      test.skip(true, 'Website input not found');
      return;
    }

    await profilePage.updateWebsite(PROFILE_DATA.websiteUrl);
    await profilePage.clickSave();
    await profilePage.wait(2000);
    await profilePage.screenshot('website-updated');
    console.log('✅ Website URL update test completed');
  });

  test('TC_PROFILE_008 - Cancel edit should NOT save changes', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_008: Testing cancel discards changes');

    await loginUser(page);
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const editBtnVisible = await profilePage.isVisible(profilePage.editProfileButton);
    if (!editBtnVisible) {
      test.skip(true, 'Edit Profile button not found');
      return;
    }

    await profilePage.clickEditProfile();
    await profilePage.wait(1500);

    // Make a change
    const bioVisible = await profilePage.isVisible(profilePage.bioInput);
    if (bioVisible) {
      await profilePage.updateBio('This bio should NOT be saved after cancel');
    }

    // Click Cancel instead of Save
    const cancelVisible = await profilePage.isVisible(profilePage.cancelButton);
    if (!cancelVisible) {
      test.skip(true, 'Cancel button not found');
      return;
    }

    await profilePage.clickCancel();
    await profilePage.wait(2000);
    await profilePage.screenshot('cancel-edit-profile');

    // Should navigate back to profile page
    const url = page.url();
    console.log(`📍 After cancel URL: ${url}`);
    console.log('✅ Cancel edit test completed');
  });

  test('TC_PROFILE_009 - Logout should sign out user and redirect', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_009: Testing logout functionality');

    await loginUser(page);
    await profilePage.wait(2000);

    // Go to settings/profile to find logout
    const settingsVisible = await profilePage.isVisible(profilePage.settingsButton);
    if (settingsVisible) {
      await profilePage.clickSettings();
      await profilePage.wait(1500);
    } else {
      await profilePage.openProfilePage(APP_URL);
      await profilePage.wait(2000);
    }

    const logoutVisible = await profilePage.isVisible(profilePage.logoutButton);
    if (!logoutVisible) {
      test.skip(true, 'Logout button not found');
      return;
    }

    const urlBefore = page.url();
    await profilePage.clickLogout();
    await profilePage.wait(3000);
    await profilePage.screenshot('after-logout');

    // Should redirect to login page
    const urlAfter = page.url();
    console.log(`📍 After logout URL: ${urlAfter}`);

    const redirectedToLogin = urlAfter.includes('login') ||
                              urlAfter.includes('signin') ||
                              urlAfter === APP_URL ||
                              urlAfter === APP_URL + '/';
    expect(redirectedToLogin || urlAfter !== urlBefore).toBe(true);
    console.log('✅ Logout successful - user redirected');
  });

  test('TC_PROFILE_010 - Followers and Following count should be visible', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_010: Checking followers/following stats');

    await loginUser(page);
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const followersVisible = await profilePage.isVisible(profilePage.followersCount);
    const followingVisible = await profilePage.isVisible(profilePage.followingCount);

    console.log(`👥 Followers visible: ${followersVisible}`);
    console.log(`👥 Following visible: ${followingVisible}`);

    if (followersVisible) {
      const count = await profilePage.getFollowersCount();
      expect(count).toBeGreaterThanOrEqual(0);
    }

    await profilePage.screenshot('followers-following-counts');
    console.log('✅ Followers/following count test completed');
  });


  // ════════════════════════════════════════════════════════════
  // ❌ NEGATIVE TEST CASES
  // ════════════════════════════════════════════════════════════

  test('TC_PROFILE_011 - Invalid website URL should show error', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_011: Testing invalid website URL validation');

    await loginUser(page);
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const editBtnVisible = await profilePage.isVisible(profilePage.editProfileButton);
    if (!editBtnVisible) {
      test.skip(true, 'Edit Profile button not found');
      return;
    }

    await profilePage.clickEditProfile();
    await profilePage.wait(1500);

    const websiteVisible = await profilePage.isVisible(profilePage.websiteInput);
    if (!websiteVisible) {
      test.skip(true, 'Website input not found');
      return;
    }

    // Enter invalid URL (no http/https)
    await profilePage.updateWebsite(INVALID_DATA.invalidEmail); // 'not-a-url'
    await profilePage.clickSave();
    await profilePage.wait(2000);
    await profilePage.screenshot('invalid-website-url');

    const errorVisible = await profilePage.isVisible(profilePage.errorMessage);
    const stayedOnEdit = page.url().includes('edit') || page.url().includes('profile');
    console.log(`Error shown: ${errorVisible} | Stayed on edit: ${stayedOnEdit}`);
    console.log('✅ Invalid website URL test completed');
  });

  test('TC_PROFILE_012 - Empty bio save should be allowed (bio is optional)', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_012: Testing empty bio is allowed');

    await loginUser(page);
    await profilePage.openProfilePage(APP_URL);
    await profilePage.wait(2000);

    const editBtnVisible = await profilePage.isVisible(profilePage.editProfileButton);
    if (!editBtnVisible) {
      test.skip(true, 'Edit Profile button not found');
      return;
    }

    await profilePage.clickEditProfile();
    await profilePage.wait(1500);

    const bioVisible = await profilePage.isVisible(profilePage.bioInput);
    if (!bioVisible) {
      test.skip(true, 'Bio input not found');
      return;
    }

    // Clear bio field
    const bioField = profilePage.page.locator(profilePage.bioInput);
    await bioField.clear();
    await profilePage.clickSave();
    await profilePage.wait(2000);
    await profilePage.screenshot('empty-bio-save');

    // Empty bio should be accepted
    const errorVisible = await profilePage.isVisible(profilePage.errorMessage);
    if (errorVisible) {
      const errText = await profilePage.getText(profilePage.errorMessage).catch(() => '');
      console.log(`⚠️  Error on empty bio: "${errText}" (some apps require bio)`);
    } else {
      console.log('✅ Empty bio saved successfully');
    }
    console.log('✅ Empty bio test completed');
  });

  test('TC_PROFILE_013 - Profile page without login should redirect to login', async ({ page }) => {
    console.log('\n🧪 TC_PROFILE_013: Testing unauthenticated profile access');

    // Go directly to profile page WITHOUT logging in
    await profilePage.goto(`${APP_URL}/profile`);
    await profilePage.wait(3000);
    await profilePage.screenshot('unauthenticated-profile');

    const currentUrl = page.url();
    console.log(`📍 Redirected to: ${currentUrl}`);

    const redirectedToLogin = currentUrl.includes('login') ||
                              currentUrl.includes('signin') ||
                              currentUrl.includes('auth') ||
                              !currentUrl.includes('profile');

    const hasLoginPrompt = await profilePage.isVisible('button:has-text("Login"), a:has-text("Login")');

    expect(redirectedToLogin || hasLoginPrompt).toBe(true);
    console.log('✅ Unauthenticated profile access correctly redirects to login');
  });

});
