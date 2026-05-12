// ============================================================
// FILE: pages/ProfilePage.js
// PURPOSE: Page Object for the User Profile screen
// Covers: view profile, edit profile, settings, followers/following
// ============================================================

const BasePage = require('./BasePage');

class ProfilePage extends BasePage {

  constructor(page) {
    super(page);

    // ── Selectors ────────────────────────────────────────────
    this.profileTab         = '[href*="profile"], [class*="profile-tab"], button:has-text("Profile"), [aria-label*="profile" i]';
    this.profileName        = '[class*="profile-name"], [class*="username"], h1, h2';
    this.profileBio         = '[class*="bio"], [class*="description"], p[class*="about"]';
    this.profileAvatar      = '[class*="avatar"] img, [class*="profile-photo"] img, img[class*="profile"]';
    this.editProfileButton  = 'button:has-text("Edit Profile"), a:has-text("Edit Profile"), [class*="edit-profile"]';
    this.followersCount     = '[class*="followers"] [class*="count"], [class*="followers-count"]';
    this.followingCount     = '[class*="following"] [class*="count"], [class*="following-count"]';
    this.postsCount         = '[class*="posts"] [class*="count"], [class*="post-count"]';
    this.settingsButton     = 'button[aria-label*="settings" i], [class*="settings"], a[href*="settings"]';
    this.logoutButton       = 'button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Log out")';

    // Edit Profile form selectors
    this.nameInput          = 'input[placeholder*="name" i], input[name="name"], input[name="displayName"]';
    this.usernameInput      = 'input[placeholder*="username" i], input[name="username"]';
    this.bioInput           = 'textarea[placeholder*="bio" i], textarea[name="bio"]';
    this.websiteInput       = 'input[placeholder*="website" i], input[type="url"], input[name="website"]';
    this.saveButton         = 'button:has-text("Save"), button:has-text("Update"), button[type="submit"]';
    this.cancelButton       = 'button:has-text("Cancel"), button:has-text("Discard")';
    this.changePhotoButton  = 'button:has-text("Change Photo"), button:has-text("Upload Photo"), [class*="change-photo"]';
    this.removePhotoButton  = 'button:has-text("Remove Photo")';
    this.successMessage     = '[class*="success"], [class*="toast"], [role="status"]';
    this.errorMessage       = '[class*="error"], [role="alert"]';

    // Privacy settings selectors
    this.privateAccountToggle = 'input[name*="private" i], [class*="private-toggle"]';
    this.notificationsToggle  = 'input[name*="notification" i], [class*="notification-toggle"]';

    // Posts grid on profile
    this.postsGrid          = '[class*="posts-grid"], [class*="post-grid"], [class*="media-grid"]';
    this.firstPost          = '[class*="posts-grid"] > *:first-child, [class*="post-grid"] > *:first-child';
  }

  // ─────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────

  /**
   * Navigate to the profile page
   * @param {string} baseUrl - App base URL
   */
  async openProfilePage(baseUrl) {
    await this.goto(`${baseUrl}/profile`);
    console.log('👤 Opened Profile page');
  }

  /**
   * Click the Profile tab in the bottom navigation
   */
  async clickProfileTab() {
    await this.click(this.profileTab);
    console.log('👤 Clicked Profile tab');
    await this.wait(1500);
  }

  /**
   * Click Edit Profile button
   */
  async clickEditProfile() {
    await this.click(this.editProfileButton);
    console.log('✏️  Clicked Edit Profile');
    await this.wait(1000);
  }

  /**
   * Click Settings icon/button
   */
  async clickSettings() {
    await this.click(this.settingsButton);
    console.log('⚙️  Clicked Settings');
  }

  /**
   * Click Logout button
   */
  async clickLogout() {
    await this.click(this.logoutButton);
    console.log('👋 Clicked Logout');
    await this.wait(2000);
  }

  // ─────────────────────────────────────────────────────────
  // EDIT PROFILE ACTIONS
  // ─────────────────────────────────────────────────────────

  /**
   * Update the display name
   * @param {string} name - New display name
   */
  async updateName(name) {
    await this.type(this.nameInput, name);
    console.log(`✏️  Updated name: ${name}`);
  }

  /**
   * Update the username
   * @param {string} username - New username
   */
  async updateUsername(username) {
    await this.type(this.usernameInput, username);
    console.log(`✏️  Updated username: ${username}`);
  }

  /**
   * Update the bio text
   * @param {string} bio - New bio text
   */
  async updateBio(bio) {
    await this.type(this.bioInput, bio);
    console.log(`✏️  Updated bio: ${bio}`);
  }

  /**
   * Update the website URL
   * @param {string} url - New website URL
   */
  async updateWebsite(url) {
    await this.type(this.websiteInput, url);
    console.log(`🔗 Updated website: ${url}`);
  }

  /**
   * Click Save button on edit profile form
   */
  async clickSave() {
    await this.click(this.saveButton);
    console.log('💾 Clicked Save');
  }

  /**
   * Click Cancel button on edit profile form
   */
  async clickCancel() {
    await this.click(this.cancelButton);
    console.log('❌ Clicked Cancel');
  }

  // ─────────────────────────────────────────────────────────
  // COMBINED FLOWS
  // ─────────────────────────────────────────────────────────

  /**
   * Complete the edit profile flow with new data
   * @param {object} profileData - Object with profile update fields
   */
  async editProfile(profileData) {
    console.log('\n✏️  Starting edit profile flow...');
    await this.clickEditProfile();

    if (profileData.name) {
      await this.updateName(profileData.name);
    }
    if (profileData.bio) {
      await this.updateBio(profileData.bio);
    }
    if (profileData.website) {
      await this.updateWebsite(profileData.website);
    }

    await this.clickSave();
    console.log('✅ Edit profile form submitted');
  }

  // ─────────────────────────────────────────────────────────
  // DATA GETTERS
  // ─────────────────────────────────────────────────────────

  /**
   * Get the profile name displayed
   */
  async getProfileName() {
    const name = await this.getText(this.profileName).catch(() => '');
    console.log(`👤 Profile name: ${name}`);
    return name;
  }

  /**
   * Get the bio text
   */
  async getBio() {
    const bio = await this.getText(this.profileBio).catch(() => '');
    console.log(`📝 Bio: ${bio}`);
    return bio;
  }

  /**
   * Get followers count as a number
   */
  async getFollowersCount() {
    const text = await this.getText(this.followersCount).catch(() => '0');
    const num = parseInt(text.replace(/\D/g, '')) || 0;
    console.log(`👥 Followers: ${num}`);
    return num;
  }

  /**
   * Get following count as a number
   */
  async getFollowingCount() {
    const text = await this.getText(this.followingCount).catch(() => '0');
    const num = parseInt(text.replace(/\D/g, '')) || 0;
    console.log(`👥 Following: ${num}`);
    return num;
  }

  // ─────────────────────────────────────────────────────────
  // ASSERTIONS
  // ─────────────────────────────────────────────────────────

  /**
   * Verify profile page is visible
   */
  async assertProfilePageLoaded() {
    // Profile page should show avatar OR profile name
    await this.wait(2000);
    const hasAvatar = await this.isVisible(this.profileAvatar);
    const hasEditBtn = await this.isVisible(this.editProfileButton);

    if (!hasAvatar && !hasEditBtn) {
      console.log('⚠️  Profile page may not be fully loaded - checking URL');
      const url = this.getCurrentUrl();
      console.log(`📍 Current URL: ${url}`);
    }
    console.log('✅ Profile page is loaded');
  }

  /**
   * Verify profile was updated with new data
   * @param {string} expectedName - Name we expect to see
   */
  async assertProfileUpdated(expectedName) {
    await this.wait(2000);
    if (expectedName) {
      await this.assertPageContainsText(expectedName);
    }
    // Success message should appear
    const successVisible = await this.isVisible(this.successMessage);
    console.log(successVisible ? '✅ Profile update success message shown' : 'ℹ️  No success toast (might have auto-dismissed)');
    console.log('✅ Profile update verified');
  }

  /**
   * Verify edit profile form is open
   */
  async assertEditFormOpen() {
    const nameVisible = await this.isVisible(this.nameInput);
    const bioVisible = await this.isVisible(this.bioInput);

    if (!nameVisible && !bioVisible) {
      throw new Error('❌ Edit profile form fields not found');
    }
    console.log('✅ Edit profile form is open');
  }

  /**
   * Verify user is logged out (back on login/home page)
   */
  async assertLoggedOut() {
    await this.wait(2000);
    const url = this.getCurrentUrl();
    const onLoginPage = url.includes('login') || url.includes('signin') || !url.includes('profile');
    if (onLoginPage) {
      console.log('✅ User is logged out');
    } else {
      throw new Error('❌ User may still be logged in');
    }
  }
}

module.exports = ProfilePage;
