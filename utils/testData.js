// ============================================================
// FILE: utils/testData.js
// PURPOSE: All test data in ONE place
// Why? If phone/email changes, you update here ONCE, not in 10 files
// ============================================================

// ─────────────────────────────────────────────────────────────
// APP URL - The web version of Begenuin app
// NOTE: Playwright tests the web/PWA version of the Android app
// ─────────────────────────────────────────────────────────────
const APP_URL = 'https://begenuin.com'; // Web version of the app

// ─────────────────────────────────────────────────────────────
// VALID USER CREDENTIALS (for login tests)
// ⚠️ IMPORTANT: Replace with REAL test account credentials
//    Never put real production user data in test files!
// ─────────────────────────────────────────────────────────────
const VALID_USER = {
  phone: '9876543210',          // Test account phone number
  email: 'testuser@example.com', // Test account email
  password: 'Test@1234',        // Test account password
  username: 'test_user_qa',     // Test account username
  otp: '123456',                // OTP (use static OTP for test env)
};

// ─────────────────────────────────────────────────────────────
// NEW USER DATA (for signup tests)
// These are used when testing the registration flow
// ─────────────────────────────────────────────────────────────
const NEW_USER = {
  firstName: 'QA',
  lastName: 'Tester',
  username: `qauser_${Date.now()}`,        // Unique username every run
  email: `qa_${Date.now()}@mailtest.com`, // Unique email every run
  phone: '9123456789',
  password: 'QaTest@5678',
  confirmPassword: 'QaTest@5678',
  bio: 'I am a QA automation test user created by Playwright.',
};

// ─────────────────────────────────────────────────────────────
// INVALID / NEGATIVE TEST DATA
// Used for testing what happens with WRONG inputs
// ─────────────────────────────────────────────────────────────
const INVALID_DATA = {
  wrongPhone: '0000000000',           // Phone that doesn't exist
  wrongOtp: '999999',                 // Wrong OTP code
  shortPassword: '123',               // Too short password
  invalidEmail: 'notanemail',         // Missing @ symbol
  emptyString: '',                    // Empty input
  specialCharsUsername: '@@##$$%%',  // Invalid chars in username
  longText: 'A'.repeat(300),         // Very long text (edge case)
  numbersOnlyName: '12345',           // Numbers where name expected
  sqlInjection: "'; DROP TABLE users; --", // Security test input
};

// ─────────────────────────────────────────────────────────────
// POST DATA (for create post tests)
// ─────────────────────────────────────────────────────────────
const POST_DATA = {
  validCaption: 'This is a test post created by Playwright automation 🎉',
  shortCaption: 'Hi!',
  longCaption: 'This is a very long caption. '.repeat(20), // 600+ chars
  emojiCaption: '🎉🔥💯🚀✨ Testing with emojis!',
  specialCharsCaption: 'Post with @mention and #hashtag and https://link.com',
};

// ─────────────────────────────────────────────────────────────
// PROFILE DATA (for profile edit tests)
// ─────────────────────────────────────────────────────────────
const PROFILE_DATA = {
  updatedBio: 'Updated bio by Playwright automation test.',
  updatedName: 'QA Updated',
  websiteUrl: 'https://example.com',
  invalidWebsite: 'not-a-url',
};

// ─────────────────────────────────────────────────────────────
// EXPECTED MESSAGES
// Text you expect to see after certain actions
// ─────────────────────────────────────────────────────────────
const EXPECTED_MESSAGES = {
  loginSuccess: 'Welcome',
  loginFailed: 'Invalid',
  signupSuccess: 'Account created',
  otpSent: 'OTP sent',
  profileUpdated: 'Profile updated',
  postCreated: 'Post created',
  requiredField: 'required',
};

// ─────────────────────────────────────────────────────────────
// TIMEOUTS (milliseconds)
// Centralized timeout values - change here to affect all tests
// ─────────────────────────────────────────────────────────────
const TIMEOUTS = {
  short: 5000,    // 5 seconds - for quick UI changes
  medium: 15000,  // 15 seconds - for network requests
  long: 30000,    // 30 seconds - for slow operations
  otp: 60000,     // 60 seconds - waiting for OTP SMS
};

// Export everything
module.exports = {
  APP_URL,
  VALID_USER,
  NEW_USER,
  INVALID_DATA,
  POST_DATA,
  PROFILE_DATA,
  EXPECTED_MESSAGES,
  TIMEOUTS,
};
