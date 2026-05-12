# 🤖 Begenuin Android App - Playwright Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-1.44.0-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-yellow)
![Node.js](https://img.shields.io/badge/Node.js-18+-blue)
![Mobile Testing](https://img.shields.io/badge/Mobile-Android-orange)

> A professional Playwright automation framework for testing the **Begenuin** Android app's web/PWA version using JavaScript. Built with the Page Object Model (POM) design pattern.

---

## 📋 Table of Contents

1. [What This Framework Tests](#what-this-framework-tests)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Setup](#step-by-step-setup)
5. [Running Tests](#running-tests)
6. [Generating Reports](#generating-reports)
7. [File Explanations](#file-explanations)
8. [Test Cases List](#test-cases-list)
9. [GitHub Setup](#github-setup)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 What This Framework Tests

This framework tests the **web/PWA version** of the [Begenuin](https://begenuin.com) Android app using Playwright's Android device simulation (screen size, touch, mobile user-agent).

### Why Web/PWA instead of native APK?
> Playwright can test **Android apps that have a web interface or PWA**. For fully native APK testing, tools like Appium + Android emulator are required. This framework uses Playwright's built-in mobile emulation, which perfectly tests the mobile web experience.

**Features Covered:**
- ✅ Login (Phone+OTP, Email+Password)
- ✅ Signup / Registration
- ✅ Create Post
- ✅ User Profile (View, Edit, Logout)
- ✅ Negative / Error scenarios
- ✅ Edge cases (SQL injection, long text, empty fields)

---

## 📁 Project Structure

```
begenuin-playwright-framework/
│
├── tests/                     ← All test files live here
│   ├── login.spec.js          ← Login test cases (12 tests)
│   ├── signup.spec.js         ← Signup test cases (11 tests)
│   ├── createPost.spec.js     ← Create post test cases (11 tests)
│   └── profile.spec.js        ← Profile test cases (13 tests)
│
├── pages/                     ← Page Object Model files
│   ├── BasePage.js            ← Parent class (shared methods)
│   ├── LoginPage.js           ← Login screen actions & selectors
│   ├── SignupPage.js          ← Signup screen actions & selectors
│   ├── CreatePostPage.js      ← Create post screen actions
│   └── ProfilePage.js        ← Profile screen actions & selectors
│
├── utils/                     ← Reusable utility functions
│   ├── helpers.js             ← Screenshot, wait, scroll helpers
│   └── testData.js            ← All test data in one place
│
├── screenshots/               ← Screenshots saved here (auto-created)
├── playwright-report/         ← HTML report saved here (auto-created)
├── test-results/              ← JSON/XML results (auto-created)
│
├── playwright.config.js       ← Main Playwright configuration
├── package.json               ← Project dependencies & scripts
├── .env.example               ← Environment variables template
├── .gitignore                 ← Files to exclude from GitHub
└── README.md                  ← This file
```

---

## ✅ Prerequisites

Before you start, make sure these are installed on your computer:

### 1. Node.js (Version 18 or higher)
```bash
# Check if installed
node --version

# If not installed, download from: https://nodejs.org
# Choose "LTS" version
```

### 2. npm (comes with Node.js)
```bash
# Check if installed
npm --version
```

### 3. Git
```bash
# Check if installed
git --version

# Download from: https://git-scm.com
```

### 4. VS Code (Recommended Editor)
Download from: https://code.visualstudio.com

**Recommended VS Code Extensions:**
- Playwright Test for VS Code (ms-playwright.playwright)
- JavaScript (ES6) code snippets

---

## 🚀 Step-by-Step Setup

### Step 1: Create Project Folder
```bash
# Create a new folder for your project
mkdir begenuin-playwright-framework

# Navigate into it
cd begenuin-playwright-framework
```

### Step 2: Copy All Project Files
Copy all the files from this framework into your project folder, maintaining the exact folder structure shown above.

### Step 3: Install Node.js Dependencies
```bash
# This reads package.json and installs all required packages
npm install
```
> ⏳ This may take 1-2 minutes. You'll see a `node_modules` folder appear.

### Step 4: Install Playwright Browsers
```bash
# This downloads Chromium, Firefox, and WebKit browsers
npx playwright install

# If you only want Chromium (faster):
npx playwright install chromium
```
> ⏳ This downloads ~300MB of browser files. Wait for it to complete.

### Step 5: Setup Environment Variables
```bash
# Copy the example .env file
# On Windows:
copy .env.example .env

# On Mac/Linux:
cp .env.example .env
```

Then open `.env` and update with your test credentials:
```
TEST_PHONE=your_test_phone
TEST_EMAIL=your_test_email@example.com
TEST_PASSWORD=YourTestPassword@123
```

### Step 6: Create Required Folders
```bash
# These folders are created automatically when tests run,
# but you can create them manually:
mkdir screenshots
mkdir test-results
mkdir playwright-report
```

### Step 7: Verify Setup
```bash
# Check that everything works
npx playwright --version

# Should show something like: Version 1.44.0
```

---

## ▶️ Running Tests

### Run ALL tests
```bash
npm test
# OR
npx playwright test
```

### Run a specific test file
```bash
# Run only login tests
npm run test:login
# OR
npx playwright test tests/login.spec.js

# Run only signup tests
npm run test:signup

# Run only create post tests
npm run test:createPost

# Run only profile tests
npm run test:profile
```

### Run tests with visible browser (headed mode)
```bash
# See the browser open and tests run live
npm run test:headed
# OR
npx playwright test --headed
```

### Run tests in debug mode (step by step)
```bash
npm run test:debug
# OR
npx playwright test --debug
```
> 🐛 Debug mode pauses before each action. Press F10 to step through.

### Run a specific test by name
```bash
# Run a test whose name contains "valid credentials"
npx playwright test --grep "valid credentials"

# Run all negative tests
npx playwright test --grep "TC_LOGIN_00[6-9]"
```

### Run on specific device only
```bash
# Run only on Android mobile (not tablet)
npx playwright test --project=android-mobile

# Run only on tablet
npx playwright test --project=android-tablet
```

### Run with more details in terminal
```bash
npx playwright test --reporter=list
```

---

## 📊 Generating Reports

### Open the HTML Report
```bash
# After running tests, open the beautiful HTML report
npm run report
# OR
npx playwright show-report
```
> This opens a browser window with full test results, screenshots, and timings.

### Where reports are saved
| File/Folder | Contents |
|---|---|
| `playwright-report/index.html` | Main HTML report (open in browser) |
| `test-results/results.json` | JSON results (for CI/CD tools) |
| `screenshots/` | All screenshots taken during tests |

### View Screenshots
All screenshots are saved in the `screenshots/` folder with timestamps.
- `FAILURE_TC_LOGIN_001-2024-01-15.png` = Screenshot on test failure
- `login-page-start-2024-01-15.png` = Screenshot from test steps

---

## 📂 File Explanations

### `playwright.config.js`
The main configuration file. Controls:
- Which devices to simulate (Pixel 5, Galaxy Tab)
- Timeouts for actions and tests
- Where to save reports and screenshots
- How many times to retry failed tests

### `pages/BasePage.js`
The **parent class** for all page objects. Contains common methods:
- `goto(url)` - Navigate to a URL
- `click(selector)` - Click an element
- `type(selector, text)` - Clear + type in input field
- `isVisible(selector)` - Returns true/false
- `assertVisible(selector)` - Fails test if not visible
- `screenshot(name)` - Take a screenshot

### `pages/LoginPage.js`
Handles all login screen interactions:
- `openLoginPage(url)` - Navigate to login
- `enterPhone(phone)` - Type phone number
- `clickSendOtp()` - Click Send OTP button
- `enterOtp(otp)` - Type OTP code
- `loginWithEmailPassword(email, pass)` - Complete email login

### `utils/helpers.js`
Standalone reusable functions:
- `takeScreenshot(page, name)` - Save screenshot to /screenshots
- `takeFailureScreenshot(page, testName)` - Screenshot on failure
- `generateUniqueEmail()` - Create unique email for tests
- `scrollDown(page, pixels)` - Scroll the page

### `utils/testData.js`
All test data in one file:
- `APP_URL` - App's base URL
- `VALID_USER` - Valid login credentials
- `NEW_USER` - Data for signup tests
- `INVALID_DATA` - Wrong/bad data for negative tests
- `POST_DATA` - Sample post content
- `TIMEOUTS` - Standardized wait times

---

## 🧪 Test Cases List

### Login Tests (login.spec.js)
| Test ID | Test Name | Type |
|---|---|---|
| TC_LOGIN_001 | App loads and shows login screen | Positive |
| TC_LOGIN_002 | Login page has required UI elements | Positive |
| TC_LOGIN_003 | Valid phone triggers OTP send | Positive |
| TC_LOGIN_004 | Valid credentials login succeeds | Positive |
| TC_LOGIN_005 | Signup link navigates to registration | Positive |
| TC_LOGIN_006 | Empty field shows error | Negative |
| TC_LOGIN_007 | Invalid phone shows error | Negative |
| TC_LOGIN_008 | Wrong OTP is rejected | Negative |
| TC_LOGIN_009 | Invalid email format shows error | Negative |
| TC_LOGIN_010 | Short password shows error | Negative |
| TC_LOGIN_011 | SQL injection handled safely | Security |
| TC_LOGIN_012 | Very long text handled safely | Edge Case |

### Signup Tests (signup.spec.js)
| Test ID | Test Name | Type |
|---|---|---|
| TC_SIGNUP_001 | Signup page loads with form | Positive |
| TC_SIGNUP_002 | Username availability check works | Positive |
| TC_SIGNUP_003 | Complete form enables submit | Positive |
| TC_SIGNUP_004 | Login link navigates to login | Positive |
| TC_SIGNUP_005 | Phone OTP flow on signup | Positive |
| TC_SIGNUP_006 | Empty form shows errors | Negative |
| TC_SIGNUP_007 | Invalid email format rejected | Negative |
| TC_SIGNUP_008 | Mismatched passwords show error | Negative |
| TC_SIGNUP_009 | Short password rejected | Negative |
| TC_SIGNUP_010 | Special chars in username handled | Negative |
| TC_SIGNUP_011 | Duplicate email shows error | Negative |

### Create Post Tests (createPost.spec.js)
| Test ID | Test Name | Type |
|---|---|---|
| TC_POST_001 | Home/feed page loads | Positive |
| TC_POST_002 | Create button visible when logged in | Positive |
| TC_POST_003 | Create button opens post form | Positive |
| TC_POST_004 | Caption field accepts text | Positive |
| TC_POST_005 | Post with valid caption succeeds | Positive |
| TC_POST_006 | Emoji in caption works | Positive |
| TC_POST_007 | Hashtags in post work | Positive |
| TC_POST_008 | Discard post navigates back | Positive |
| TC_POST_009 | Empty caption is blocked | Negative |
| TC_POST_010 | Very long caption handled | Edge Case |
| TC_POST_011 | Unauthenticated user redirected | Security |

### Profile Tests (profile.spec.js)
| Test ID | Test Name | Type |
|---|---|---|
| TC_PROFILE_001 | Main app screen loads | Positive |
| TC_PROFILE_002 | Profile tab is accessible | Positive |
| TC_PROFILE_003 | Profile shows user information | Positive |
| TC_PROFILE_004 | Edit Profile button opens form | Positive |
| TC_PROFILE_005 | Edit bio saves successfully | Positive |
| TC_PROFILE_006 | Edit name saves successfully | Positive |
| TC_PROFILE_007 | Add website URL works | Positive |
| TC_PROFILE_008 | Cancel edit discards changes | Positive |
| TC_PROFILE_009 | Logout redirects to login | Positive |
| TC_PROFILE_010 | Followers/following count visible | Positive |
| TC_PROFILE_011 | Invalid website URL shows error | Negative |
| TC_PROFILE_012 | Empty bio is allowed (optional) | Negative |
| TC_PROFILE_013 | Unauthenticated profile redirects | Security |

---

## 🐙 GitHub Setup

### Files to UPLOAD to GitHub ✅
```
tests/
pages/
utils/
playwright.config.js
package.json
.env.example        ← Template only (NOT the real .env)
.gitignore
README.md
```

### Files to NOT UPLOAD ❌
```
node_modules/       ← Too large, reinstalled via npm install
.env                ← Contains sensitive passwords
playwright-report/  ← Generated during test runs
test-results/       ← Generated during test runs
screenshots/        ← Generated during test runs
```

### Creating Your GitHub Repository

**Step 1:** Create a new repository at https://github.com/new
- Repository name: `begenuin-playwright-automation`
- Description: `Playwright Automation Framework for Begenuin Android App`
- Visibility: Public (for portfolio) or Private
- ✅ Add README.md: NO (we already have one)

**Step 2:** Initialize Git in your project folder
```bash
# Open terminal in your project folder
git init
git add .
git commit -m "Initial commit: Playwright automation framework for Begenuin"
```

**Step 3:** Connect and push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/begenuin-playwright-automation.git
git branch -M main
git push -u origin main
```

**Step 4:** Verify on GitHub
Go to your repo URL and confirm all files uploaded correctly.

---

## 💡 Best Practices for Fresher QA Engineers

### 1. Always Use Meaningful Test Names
```javascript
// ❌ Bad
test('test1', async ({ page }) => { ... });

// ✅ Good
test('TC_LOGIN_001 - Valid credentials should login successfully', async ({ page }) => { ... });
```

### 2. One Test = One Behavior
Each test should verify only ONE thing. Don't combine multiple scenarios.

### 3. Never Use Fixed Wait (Sleep)
```javascript
// ❌ Bad - Always waits 5 seconds even if element loads in 1s
await page.waitForTimeout(5000);

// ✅ Good - Waits only until element appears (faster & reliable)
await page.waitForSelector('.home-screen');
```

### 4. Always Take Screenshots on Failure
The `afterEach` hook in each spec file automatically takes screenshots when a test fails. **Don't remove this!**

### 5. Keep Selectors in Page Objects
```javascript
// ❌ Bad - selector in test file
await page.click('button[type="submit"]');

// ✅ Good - selector in LoginPage.js, action in test
await loginPage.clickLogin();
```

### 6. Use Descriptive Console Logs
```javascript
console.log('✅ Login successful');
console.log('❌ Error appeared as expected');
console.log(`📍 Current URL: ${url}`);
```

### 7. Use `test.skip()` for Unavailable Features
```javascript
if (!elementVisible) {
  test.skip(true, 'Feature not available in this version');
  return;
}
```

### 8. Update Selectors When App Changes
If the app updates its HTML, selectors may break. Use multiple fallback selectors:
```javascript
this.loginButton = 'button[type="submit"], button:has-text("Login"), button:has-text("Sign In")';
```

---

## 🔧 Troubleshooting

### Problem: `npm install` fails
```bash
# Try clearing npm cache
npm cache clean --force
npm install
```

### Problem: Playwright browsers not found
```bash
npx playwright install --with-deps chromium
```

### Problem: Tests fail with "Element not found"
1. Open the app in browser (https://begenuin.com)
2. Right-click the element → Inspect
3. Find the correct CSS selector
4. Update the selector in the relevant Page Object file

### Problem: Tests are slow
- Reduce `timeout` in `playwright.config.js`
- Remove unnecessary `await waitFor()` calls
- Run only one project: `--project=android-mobile`

### Problem: Screenshots not saving
```bash
# Create the screenshots folder manually
mkdir screenshots
```

### Problem: `.env` file not loading
```bash
# Make sure dotenv is installed
npm install dotenv

# Make sure .env file is in the ROOT folder (same level as package.json)
```

---

## 📞 Support

- **Playwright Docs:** https://playwright.dev/docs
- **Playwright GitHub:** https://github.com/microsoft/playwright
- **Community Discord:** https://discord.gg/playwright-807756831384403968

---

*Framework created for the Begenuin Android App automated testing assignment.*
*Built with ❤️ by a Junior QA Automation Engineer learning Playwright.*
