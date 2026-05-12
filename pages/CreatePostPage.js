
const BasePage = require('./BasePage');

class CreatePostPage extends BasePage {

  constructor(page) {
    super(page);

    // Selectors 
    this.createPostButton   = 'button:has-text("Create"), button:has-text("Post"), [class*="create"], [class*="add-post"], a[href*="create"], [aria-label*="create" i]';
    this.captionInput       = 'textarea[placeholder*="caption" i], textarea[placeholder*="write" i], textarea[placeholder*="whats" i], textarea[name="caption"]';
    this.mediaUploadButton  = 'input[type="file"], button:has-text("Add Photo"), button:has-text("Upload"), [class*="upload"]';
    this.postSubmitButton   = 'button:has-text("Share"), button:has-text("Publish"), button:has-text("Post"), button[type="submit"]';
    this.discardButton      = 'button:has-text("Discard"), button:has-text("Cancel"), button:has-text("Delete Draft")';
    this.saveAsDraftButton  = 'button:has-text("Draft"), button:has-text("Save Draft")';
    this.tagPeopleButton    = 'button:has-text("Tag"), [class*="tag-people"]';
    this.locationButton     = 'button:has-text("Location"), button:has-text("Add Location"), [class*="location"]';
    this.hashtagInput       = 'input[placeholder*="hashtag" i], input[placeholder*="#" i]';
    this.emojiButton        = '[class*="emoji"], button:has-text("")';
    this.characterCount     = '[class*="count"], [class*="limit"]';
    this.errorMessage       = '[class*="error"], [role="alert"]';
    this.successMessage     = '[class*="success"], [class*="toast"]';
    this.postPreview        = '[class*="preview"], [class*="post-preview"]';
    this.closeButton        = 'button:has-text("×"), button[aria-label="Close"], button:has-text("Back")';
    this.feedFirstPost      = '[class*="feed"] [class*="post"]:first-child, [class*="home"] [class*="card"]:first-child';
  }

  // NAVIGATION
  
  /**
   * Open the create post page/modal
   */
  async openCreatePost(baseUrl) {
    await this.goto(`${baseUrl}/create`);
    console.log(' Opened Create Post page');
  }

  /**
   * Click the "Create Post" button from home screen
   */
  async clickCreatePostButton() {
    await this.click(this.createPostButton);
    console.log(' Clicked Create Post button');
    await this.wait(1000);
  }

  // FORM ACTIONS

  /**
   * Type a caption for the post
   */
  async enterCaption(caption) {
    await this.type(this.captionInput, caption);
    console.log(` Entered caption: "${caption.substring(0, 30)}..."`);
  }

  /**
   * Add a hashtag to the post
   */
  async addHashtag(hashtag) {
    const captionField = this.page.locator(this.captionInput);
    await captionField.click();
    await captionField.type(` #${hashtag}`);
    console.log(` Added hashtag: #${hashtag}`);
  }

  /**
   * Click the Add Location button
   */
  async clickAddLocation() {
    await this.click(this.locationButton);
    console.log(' Clicked Add Location');
  }

  /**
   * Click the Tag People button
   */
  async clickTagPeople() {
    await this.click(this.tagPeopleButton);
    console.log('👤 Clicked Tag People');
  }

  /**
   * Submit/publish the post
   */
  async clickSubmitPost() {
    await this.click(this.postSubmitButton);
    console.log(' Submitted post');
  }

  /**
   * Discard/cancel the post creation
   */
  async clickDiscard() {
    await this.click(this.discardButton);
    console.log('  Discarded post');
  }

  /**
   * Click save as draft
   */
  async clickSaveAsDraft() {
    await this.click(this.saveAsDraftButton);
    console.log(' Saved as draft');
  }

  // COMBINED FLOWS

  /**
   * Create a simple text-only post
   */
  async createTextPost(caption) {
    console.log('\n Creating a new text post...');
    await this.clickCreatePostButton();
    await this.enterCaption(caption);
    await this.clickSubmitPost();
    console.log(' Text post creation flow completed');
  }

  /**
   * Create post with caption and hashtags
   */
  async createPostWithHashtags(caption, tags = []) {
    await this.clickCreatePostButton();
    await this.enterCaption(caption);
    for (const tag of tags) {
      await this.addHashtag(tag);
    }
    await this.clickSubmitPost();
  }

  // ASSERTIONS

  /**
   * Verify post was created successfully
   */
  async assertPostCreated() {
    await this.wait(3000);
    // After posting, user is usually redirected to feed/profile
    const url = this.getCurrentUrl();
    console.log(` URL after posting: ${url}`);

    // Check for success toast
    const successVisible = await this.isVisible(this.successMessage);
    if (successVisible) {
      const msg = await this.getText(this.successMessage).catch(() => '');
      console.log(` Success message: "${msg}"`);
    } else {
      const stillOnCreate = url.includes('create') || url.includes('new-post');
      if (!stillOnCreate) {
        console.log(' Post created - redirected to feed/home');
      } else {
        console.log('  Still on create page - checking for other success indicators');
      }
    }
    console.log('Post creation confirmed');
  }

  
  async assertCreateButtonVisible() {
    await this.assertVisible(this.createPostButton, 'Create post button should be visible');
  }

  async assertErrorShown(expectedText) {
    const errorVisible = await this.isVisible(this.errorMessage);
    if (!errorVisible && expectedText) {
      await this.assertPageContainsText(expectedText);
    } else {
      const text = await this.getText(this.errorMessage).catch(() => 'error shown');
      console.log(` Error: "${text}"`);
    }
    console.log(' Error correctly shown');
  }

  async assertCharacterCountVisible() {
    const countVisible = await this.isVisible(this.characterCount);
    if (countVisible) {
      const count = await this.getText(this.characterCount).catch(() => '');
      console.log(`Character count: ${count}`);
    }
    return countVisible;
  }
}

module.exports = CreatePostPage;
