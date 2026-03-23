import { test, expect } from '@playwright/test';
import { SignInPage } from '../pages/sign-in.page';
import { DashboardPage } from '../pages/dashboard.page';
import { AdminLayoutPage } from '../pages/admin-layout.page';
import { PresenterPage } from '../pages/presenter.page';
import { loginAsAdmin } from '../helpers/auth.helper';
import { mockDashboard, mockCurrentUser, mockQuestions, mockResponses } from '../fixtures/mock-data';

function setupAdminMocks(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/dashboard**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboard),
      })
    ),
    page.route('**/api/users/me**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCurrentUser),
      })
    ),
  ]);
}

test.describe('Visual Design - Fonts', () => {
  test('should use Inconsolata font on sign-in logo', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.expectLogoFont('Inconsolata');
  });

  test('should use DM Sans on body text', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();

    const bodyFont = await page.evaluate(() =>
      getComputedStyle(document.body).fontFamily
    );
    expect(bodyFont.toLowerCase()).toContain('dm sans');
  });

  test('should use Inconsolata on dashboard response count', async ({ page }) => {
    await setupAdminMocks(page);
    await loginAsAdmin(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    const font = await dashboardPage.responseCount.evaluate((el) =>
      getComputedStyle(el).fontFamily
    );
    expect(font.toLowerCase()).toMatch(/inconsolata/);
  });

  test('should use Inconsolata on presenter response counter', async ({ page }) => {
    await page.route('**/api/questions/1**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockQuestions[0]),
      })
    );
    await page.route('**/api/questions/1/responses**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses),
      })
    );

    const presenterPage = new PresenterPage(page);
    await presenterPage.goto('1');

    const font = await presenterPage.responseCounter.evaluate((el) =>
      getComputedStyle(el).fontFamily
    );
    expect(font.toLowerCase()).toMatch(/inconsolata/);
  });

  test('should use DM Sans on dashboard labels', async ({ page }) => {
    await setupAdminMocks(page);
    await loginAsAdmin(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    const cardFont = await dashboardPage.activeQuestionCard.evaluate((el) =>
      getComputedStyle(el).fontFamily
    );
    expect(cardFont.toLowerCase()).toContain('dm sans');
  });
});

test.describe('Visual Design - Spacing and Sizing', () => {
  test('should have 240px sidebar width on desktop', async ({ page }) => {
    await setupAdminMocks(page);
    await loginAsAdmin(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    const adminLayout = new AdminLayoutPage(page);
    await page.goto('/dashboard');
    await adminLayout.expectSidebarVisible();

    const sidebarBox = await adminLayout.sidebar.boundingBox();
    expect(sidebarBox).toBeTruthy();
    if (sidebarBox) {
      expect(sidebarBox.width).toBeCloseTo(240, -1); // within 10px
    }
  });

  test('should have 8px border-radius on buttons', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();
    await signInPage.expectButtonRadius('8px');
  });

  test('should have 12px border-radius on cards', async ({ page }) => {
    await setupAdminMocks(page);
    await loginAsAdmin(page);

    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    const cardRadius = await dashboardPage.activeQuestionCard.evaluate((el) =>
      getComputedStyle(el).borderRadius
    );
    expect(cardRadius).toBe('12px');
  });

  test('should have 8px border-radius on form inputs', async ({ page }) => {
    await setupAdminMocks(page);
    await loginAsAdmin(page);
    await page.route('**/api/questions**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      })
    );

    await page.goto('/questions/new');
    const titleInput = page.getByTestId('question-title-input');
    await expect(titleInput).toBeVisible();

    const inputRadius = await titleInput.evaluate((el) =>
      getComputedStyle(el).borderRadius
    );
    expect(inputRadius).toBe('8px');
  });
});

test.describe('Visual Design - Color Contrast', () => {
  test('should use correct background color on sign-in page', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();

    const bgColor = await signInPage.container.evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    // #F5F0F0 = rgb(245, 240, 240)
    expect(bgColor).toMatch(/rgb\(245,\s*240,\s*240\)/);
  });

  test('should use dark text color for readability', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();

    const textColor = await page.evaluate(() =>
      getComputedStyle(document.body).color
    );
    // #16160C = rgb(22, 22, 12) - dark text
    const rgb = textColor.match(/\d+/g)?.map(Number) ?? [];
    if (rgb.length >= 3) {
      const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
      // Dark text should have low brightness
      expect(brightness).toBeLessThan(128);
    }
  });

  test('should use accent color on interactive elements', async ({ page }) => {
    const signInPage = new SignInPage(page);
    await signInPage.goto();

    const btnBg = await signInPage.signInButton.evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );
    // #C4956A = rgb(196, 149, 106) - accent color
    expect(btnBg).toMatch(/rgb\(196,\s*149,\s*106\)/);
  });

  test('should use dark background on presenter page', async ({ page }) => {
    await page.route('**/api/questions/1**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockQuestions[0]),
      })
    );
    await page.route('**/api/questions/1/responses**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses),
      })
    );

    const presenterPage = new PresenterPage(page);
    await presenterPage.goto('1');
    await presenterPage.expectDarkBackground();
  });
});
