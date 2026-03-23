import { type Page, type Locator, expect } from '@playwright/test';

export class AdminLayoutPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly navDashboard: Locator;
  readonly navQuestions: Locator;
  readonly navUsers: Locator;
  readonly signOutButton: Locator;
  readonly userInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = page.getByTestId('admin-sidebar');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navQuestions = page.getByTestId('nav-questions');
    this.navUsers = page.getByTestId('nav-users');
    this.signOutButton = page.getByTestId('sidebar-sign-out');
    this.userInfo = page.getByTestId('sidebar-user-info');
  }

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible();
  }

  async expectSidebarHidden() {
    await expect(this.sidebar).not.toBeVisible();
  }

  async navigateToDashboard() {
    await this.navDashboard.click();
  }

  async navigateToQuestions() {
    await this.navQuestions.click();
  }

  async navigateToUsers() {
    await this.navUsers.click();
  }

  async signOut() {
    await this.signOutButton.click();
  }

  async expectUserInfoVisible() {
    await expect(this.userInfo).toBeVisible();
  }

  async expectNavLinksVisible() {
    await expect(this.navDashboard).toBeVisible();
    await expect(this.navQuestions).toBeVisible();
    await expect(this.navUsers).toBeVisible();
  }

  async expectSidebarWidth(width: string) {
    await expect(this.sidebar).toHaveCSS('width', width);
  }
}
