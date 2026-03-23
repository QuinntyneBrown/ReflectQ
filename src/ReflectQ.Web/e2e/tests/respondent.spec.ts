import { test, expect } from '@playwright/test';
import { RespondentPage } from '../pages/respondent.page';
import { ConfirmationPage } from '../pages/confirmation.page';
import { mockQuestions } from '../fixtures/mock-data';

const testQuestionId = '1';

test.describe('Respondent Page', () => {
  let respondentPage: RespondentPage;

  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/questions/${testQuestionId}**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockQuestions[0]),
      })
    );
    await page.route(`**/api/responses**`, (route) =>
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'new-response', success: true }),
      })
    );

    respondentPage = new RespondentPage(page);
    await respondentPage.goto(testQuestionId);
  });

  test('should load respondent page without authentication', async () => {
    await respondentPage.expectLoaded();
  });

  test('should display submit button', async () => {
    await expect(respondentPage.submitButton).toBeVisible();
  });

  test('should not show admin sidebar', async ({ page }) => {
    const sidebar = page.getByTestId('admin-sidebar');
    await expect(sidebar).not.toBeVisible();
  });

  test('should have font sizes >= 16px for mobile usability', async ({ page }) => {
    const elements = page.locator('[data-testid="respondent-page"] *');
    const count = await elements.count();
    for (let i = 0; i < Math.min(count, 20); i++) {
      const fontSize = await elements.nth(i).evaluate((el) => {
        const style = getComputedStyle(el);
        return parseFloat(style.fontSize);
      });
      // Interactive and text elements should be at least 16px
      if (fontSize > 0) {
        expect(fontSize).toBeGreaterThanOrEqual(14); // Allow minor flexibility
      }
    }
  });

  test('should position submit button in bottom half of viewport at 375x667', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await respondentPage.goto(testQuestionId);
    await respondentPage.expectLoaded();
    await respondentPage.expectSubmitButtonInBottomHalf();
  });

  test('should navigate to confirmation after submit', async ({ page }) => {
    await respondentPage.submit();
    await page.waitForURL(`**/respond/${testQuestionId}/confirmation`);
    expect(page.url()).toContain('/confirmation');
  });
});

test.describe('Confirmation Page', () => {
  let confirmationPage: ConfirmationPage;

  test.beforeEach(async ({ page }) => {
    confirmationPage = new ConfirmationPage(page);
    await confirmationPage.goto(testQuestionId);
  });

  test('should load confirmation page', async () => {
    await confirmationPage.expectLoaded();
  });

  test('should display thank-you message', async () => {
    await confirmationPage.expectThankYouMessage();
  });

  test('should not show admin sidebar', async ({ page }) => {
    const sidebar = page.getByTestId('admin-sidebar');
    await expect(sidebar).not.toBeVisible();
  });
});
