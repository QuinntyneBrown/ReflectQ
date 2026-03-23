import { test, expect } from '@playwright/test';
import { UserListPage } from '../pages/user-list.page';
import { AdminLayoutPage } from '../pages/admin-layout.page';
import { loginAsAdmin } from '../helpers/auth.helper';
import { mockUsers, mockCurrentUser } from '../fixtures/mock-data';

test.describe('User Management', () => {
  let userListPage: UserListPage;
  let adminLayout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/users**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUsers),
      })
    );
    await page.route('**/api/users/me**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCurrentUser),
      })
    );

    await loginAsAdmin(page);
    userListPage = new UserListPage(page);
    adminLayout = new AdminLayoutPage(page);
    await userListPage.goto();
  });

  test('should display the users table', async () => {
    await userListPage.expectLoaded();
  });

  test('should show sidebar navigation', async () => {
    await adminLayout.expectSidebarVisible();
  });

  test('should display correct number of user rows', async () => {
    await userListPage.expectTableRowCount(mockUsers.length);
  });

  test('should display Invite User button', async () => {
    await userListPage.expectInviteButtonVisible();
  });

  test('should show role badges in the table', async () => {
    await userListPage.expectRoleBadges();
  });

  test('should display user details in table columns', async ({ page }) => {
    // Verify table headers exist
    const table = userListPage.usersTable;
    await expect(table).toBeVisible();

    // Check that user names appear
    for (const user of mockUsers) {
      await expect(page.getByText(user.name)).toBeVisible();
    }
  });

  test('should trigger invite form on Invite User click', async ({ page }) => {
    await userListPage.clickInviteUser();
    // Expect a dialog, modal, or form to appear
    const inviteForm = page.locator('[role="dialog"], [data-testid*="invite"]');
    await expect(inviteForm).toBeVisible();
  });
});
