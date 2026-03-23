import { type Page, type Locator, expect } from '@playwright/test';

export class QuestionFormPage {
  readonly page: Page;
  readonly container: Locator;
  readonly titleInput: Locator;
  readonly bodyInput: Locator;
  readonly typeSelect: Locator;
  readonly optionsSection: Locator;
  readonly addOptionButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('question-form-page');
    this.titleInput = page.getByTestId('question-title-input');
    this.bodyInput = page.getByTestId('question-body-input');
    this.typeSelect = page.getByTestId('question-type-select');
    this.optionsSection = page.getByTestId('options-section');
    this.addOptionButton = page.getByTestId('add-option-btn');
    this.saveButton = page.getByTestId('save-question-btn');
    this.cancelButton = page.getByTestId('cancel-btn');
  }

  async gotoNew() {
    await this.page.goto('/questions/new');
  }

  async gotoEdit(id: string) {
    await this.page.goto(`/questions/${id}/edit`);
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.titleInput).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  async fillTitle(title: string) {
    await this.titleInput.fill(title);
  }

  async fillBody(body: string) {
    await this.bodyInput.fill(body);
  }

  async selectType(type: string) {
    await this.typeSelect.selectOption(type);
  }

  async addOption() {
    await this.addOptionButton.click();
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async expectTitleRequired() {
    await this.titleInput.fill('');
    await this.saveButton.click();
    await expect(this.titleInput).toHaveAttribute('aria-invalid', 'true');
  }

  async expectAllFieldsVisible() {
    await expect(this.titleInput).toBeVisible();
    await expect(this.bodyInput).toBeVisible();
    await expect(this.typeSelect).toBeVisible();
    await expect(this.saveButton).toBeVisible();
    await expect(this.cancelButton).toBeVisible();
  }
}
