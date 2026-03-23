import { type Page, type Locator, expect } from '@playwright/test';

export class RespondentPage {
  readonly page: Page;
  readonly container: Locator;
  readonly optionCards: Locator;
  readonly starRating: Locator;
  readonly textArea: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('respondent-page');
    this.optionCards = page.getByTestId('option-cards');
    this.starRating = page.getByTestId('star-rating');
    this.textArea = page.getByTestId('text-area-field');
    this.submitButton = page.getByTestId('submit-btn');
  }

  async goto(questionId: string) {
    await this.page.goto(`/respond/${questionId}`);
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async selectOption(index: number) {
    await this.optionCards.locator(`>> nth=${index}`).click();
  }

  async fillTextArea(text: string) {
    await this.textArea.fill(text);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectSubmitButtonInBottomHalf() {
    const viewport = this.page.viewportSize();
    if (!viewport) return;
    const box = await this.submitButton.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.y).toBeGreaterThan(viewport.height / 2);
    }
  }
}
