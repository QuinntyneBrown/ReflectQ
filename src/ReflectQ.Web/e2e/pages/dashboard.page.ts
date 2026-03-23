import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly container: Locator;
  readonly activeQuestionCard: Locator;
  readonly responseCount: Locator;
  readonly chartArea: Locator;
  readonly responseList: Locator;
  readonly exportCsvButton: Locator;
  readonly resetButton: Locator;
  readonly presenterViewButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('dashboard-page');
    this.activeQuestionCard = page.getByTestId('active-question-card');
    this.responseCount = page.getByTestId('response-count');
    this.chartArea = page.getByTestId('chart-area');
    this.responseList = page.getByTestId('response-list');
    this.exportCsvButton = page.getByTestId('export-csv-btn');
    this.resetButton = page.getByTestId('reset-btn');
    this.presenterViewButton = page.getByTestId('presenter-view-btn');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.activeQuestionCard).toBeVisible();
  }

  async expectChartVisible() {
    await expect(this.chartArea).toBeVisible();
  }

  async expectResponseListVisible() {
    await expect(this.responseList).toBeVisible();
  }

  async expectActionButtonsVisible() {
    await expect(this.exportCsvButton).toBeVisible();
    await expect(this.resetButton).toBeVisible();
    await expect(this.presenterViewButton).toBeVisible();
  }

  async clickExportCsv() {
    await this.exportCsvButton.click();
  }

  async clickReset() {
    await this.resetButton.click();
  }

  async clickPresenterView() {
    await this.presenterViewButton.click();
  }

  async expectResponseCount(count: string) {
    await expect(this.responseCount).toContainText(count);
  }
}
