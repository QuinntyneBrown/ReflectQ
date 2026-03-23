import { test, expect } from '@playwright/test';
import { SignInPage } from '../pages/sign-in.page';

test.describe('Sign-In Page', () => {
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    await signInPage.goto();
  });

  test('should load with logo, tagline, and sign-in button', async () => {
    await signInPage.expectLoaded();
    await expect(signInPage.logo).toBeVisible();
    await expect(signInPage.signInButton).toBeVisible();
  });

  test('should display split layout at desktop viewport', async ({ page }) => {
    const viewportSize = page.viewportSize();
    if (viewportSize && viewportSize.width >= 1024) {
      await signInPage.expectHeroVisible();
      const heroBox = await signInPage.hero.boundingBox();
      const buttonBox = await signInPage.signInButton.boundingBox();
      expect(heroBox).toBeTruthy();
      expect(buttonBox).toBeTruthy();
      if (heroBox && buttonBox) {
        // Hero and sign-in content should be side by side (not stacked)
        const sameRow =
          Math.abs(heroBox.y - buttonBox.y) < heroBox.height;
        expect(sameRow).toBeTruthy();
      }
    }
  });

  test('should render Inconsolata font on logo', async () => {
    await signInPage.expectLogoFont('Inconsolata');
  });

  test('should render DM Sans on body text', async ({ page }) => {
    const bodyFont = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily
    );
    expect(bodyFont.toLowerCase()).toContain('dm sans');
  });

  test('should have sign-in button with 8px border-radius', async () => {
    await signInPage.expectButtonRadius('8px');
  });

  test('should navigate to dashboard after sign-in', async ({ page }) => {
    // Mock the auth endpoint
    await page.route('**/api/auth/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'mock-jwt-token-for-testing' }),
      })
    );

    await signInPage.signIn();
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });
});
