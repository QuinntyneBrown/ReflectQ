import { type Page, type Locator, expect } from '@playwright/test';

export class UserListPage {
  readonly page: Page;
  readonly container: Locator;
  readonly usersTable: Locator;
  readonly inviteUserButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('user-list-page');
    this.usersTable = page.getByTestId('users-table');
    this.inviteUserButton = page.getByTestId('invite-user-btn');
  }

  async goto() {
    await this.page.goto('/users');
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.usersTable).toBeVisible();
  }

  async clickInviteUser() {
    await this.inviteUserButton.click();
  }

  async expectInviteButtonVisible() {
    await expect(this.inviteUserButton).toBeVisible();
  }

  async expectTableRowCount(count: number) {
    const rows = this.usersTable.locator('tbody tr');
    await expect(rows).toHaveCount(count);
  }

  async expectRoleBadges() {
    const badges = this.usersTable.locator('[class*="badge"], [class*="role"]');
    await expect(badges.first()).toBeVisible();
  }
}
