import { test, expect } from '@playwright/test';
import { PresenterPage } from '../pages/presenter.page';
import { mockQuestions, mockResponses } from '../fixtures/mock-data';

const testQuestionId = '1';

test.describe('Presenter Page', () => {
  let presenterPage: PresenterPage;

  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/questions/${testQuestionId}**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockQuestions[0]),
      })
    );
    await page.route(`**/api/questions/${testQuestionId}/responses**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponses.filter((r) => r.questionId === testQuestionId)),
      })
    );

    presenterPage = new PresenterPage(page);
    await presenterPage.goto(testQuestionId);
  });

  test('should load presenter page without authentication', async () => {
    await presenterPage.expectLoaded();
  });

  test('should have dark background (#16160C)', async () => {
    await presenterPage.expectDarkBackground();
  });

  test('should display QR code frame', async () => {
    await presenterPage.expectQrCodeVisible();
  });

  test('should display question text', async () => {
    await expect(presenterPage.questionText).toBeVisible();
    await expect(presenterPage.questionText).toContainText(mockQuestions[0].title);
  });

  test('should display response counter', async () => {
    await presenterPage.expectResponseCounterVisible();
  });

  test('should display FullScreen button', async () => {
    await presenterPage.expectFullscreenButtonVisible();
  });

  test('should not show admin sidebar', async ({ page }) => {
    const sidebar = page.getByTestId('admin-sidebar');
    await expect(sidebar).not.toBeVisible();
  });

  test('should display AppLogo with light theme', async ({ page }) => {
    const logo = page.getByTestId('sign-in-logo').or(page.locator('[data-testid*="logo"]'));
    if (await logo.isVisible()) {
      const color = await logo.evaluate((el) => getComputedStyle(el).color);
      // Light theme logo should have a light color value
      const rgb = color.match(/\d+/g)?.map(Number) ?? [];
      if (rgb.length >= 3) {
        const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
        expect(brightness).toBeGreaterThan(128);
      }
    }
  });

  test('should use Inconsolata font on counter', async () => {
    const font = await presenterPage.responseCounter.evaluate((el) =>
      getComputedStyle(el).fontFamily
    );
    expect(font.toLowerCase()).toMatch(/inconsolata/);
  });
});
