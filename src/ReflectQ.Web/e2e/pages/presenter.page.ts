import { type Page, type Locator, expect } from '@playwright/test';

export class PresenterPage {
  readonly page: Page;
  readonly container: Locator;
  readonly qrCodeFrame: Locator;
  readonly questionText: Locator;
  readonly responseCounter: Locator;
  readonly fullscreenButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('presenter-page');
    this.qrCodeFrame = page.getByTestId('qr-code-frame');
    this.questionText = page.getByTestId('question-text');
    this.responseCounter = page.getByTestId('response-counter');
    this.fullscreenButton = page.getByTestId('fullscreen-btn');
  }

  async goto(questionId: string) {
    await this.page.goto(`/present/${questionId}`);
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.questionText).toBeVisible();
  }

  async expectDarkBackground() {
    await expect(this.container).toHaveCSS('background-color', 'rgb(22, 22, 12)');
  }

  async expectQrCodeVisible() {
    await expect(this.qrCodeFrame).toBeVisible();
  }

  async expectResponseCounterVisible() {
    await expect(this.responseCounter).toBeVisible();
  }

  async expectFullscreenButtonVisible() {
    await expect(this.fullscreenButton).toBeVisible();
  }

  async clickFullscreen() {
    await this.fullscreenButton.click();
  }
}
