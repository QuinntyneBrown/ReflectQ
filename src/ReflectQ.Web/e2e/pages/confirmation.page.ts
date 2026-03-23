import { type Page, type Locator, expect } from '@playwright/test';

export class ConfirmationPage {
  readonly page: Page;
  readonly container: Locator;
  readonly confirmationMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('confirmation-page');
    this.confirmationMessage = page.getByTestId('confirmation-message');
  }

  async goto(questionId: string) {
    await this.page.goto(`/respond/${questionId}/confirmation`);
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.confirmationMessage).toBeVisible();
  }

  async expectThankYouMessage() {
    await expect(this.confirmationMessage).toContainText(/thank/i);
  }
}
