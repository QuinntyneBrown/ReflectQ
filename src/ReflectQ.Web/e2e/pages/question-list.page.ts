import { type Page, type Locator, expect } from '@playwright/test';

export class QuestionListPage {
  readonly page: Page;
  readonly container: Locator;
  readonly searchBox: Locator;
  readonly statusFilter: Locator;
  readonly archivedToggle: Locator;
  readonly questionsTable: Locator;
  readonly newQuestionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('question-list-page');
    this.searchBox = page.getByTestId('question-search');
    this.statusFilter = page.getByTestId('status-filter');
    this.archivedToggle = page.getByTestId('archived-toggle');
    this.questionsTable = page.getByTestId('questions-table');
    this.newQuestionButton = page.getByTestId('new-question-btn');
  }

  async goto() {
    await this.page.goto('/questions');
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.questionsTable).toBeVisible();
  }

  async expectSearchVisible() {
    await expect(this.searchBox).toBeVisible();
  }

  async search(query: string) {
    await this.searchBox.fill(query);
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
  }

  async toggleArchived() {
    await this.archivedToggle.click();
  }

  async clickNewQuestion() {
    await this.newQuestionButton.click();
  }

  async expectTableRowCount(count: number) {
    const rows = this.questionsTable.locator('tbody tr');
    await expect(rows).toHaveCount(count);
  }

  async expectNewQuestionButtonVisible() {
    await expect(this.newQuestionButton).toBeVisible();
  }
}
