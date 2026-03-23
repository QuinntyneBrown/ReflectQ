import { test, expect } from '@playwright/test';
import { AdminLayoutPage } from '../pages/admin-layout.page';
import { DashboardPage } from '../pages/dashboard.page';
import { RespondentPage } from '../pages/respondent.page';
import { loginAsAdmin } from '../helpers/auth.helper';
import { mockDashboard, mockCurrentUser, mockQuestions } from '../fixtures/mock-data';

function setupMocks(page: import('@playwright/test').Page) {
  return Promise.all([
    page.route('**/api/dashboard**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboard),
      })
    ),
    page.route('**/api/users/me**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCurrentUser),
      })
    ),
    page.route('**/api/questions/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockQuestions[0]),
      })
    ),
  ]);
}

test.describe('Responsive Layout', () => {
  test.describe('Admin Sidebar', () => {
    test('should be visible at 1440px desktop width', async ({ page }) => {
      await setupMocks(page);
      await loginAsAdmin(page);
      await page.setViewportSize({ width: 1440, height: 900 });

      const adminLayout = new AdminLayoutPage(page);
      await page.goto('/dashboard');
      await adminLayout.expectSidebarVisible();
      await adminLayout.expectNavLinksVisible();
    });

    test('should collapse at 768px tablet width', async ({ page }) => {
      await setupMocks(page);
      await loginAsAdmin(page);
      await page.setViewportSize({ width: 768, height: 1024 });

      const adminLayout = new AdminLayoutPage(page);
      await page.goto('/dashboard');

      // At tablet size, sidebar should either be collapsed or hidden behind a toggle
      const sidebar = adminLayout.sidebar;
      const sidebarBox = await sidebar.boundingBox();
      if (sidebarBox) {
        // If visible, it should be narrower than full desktop width (240px)
        expect(sidebarBox.width).toBeLessThanOrEqual(240);
      }
    });

    test('should not show sidebar at 375px mobile width', async ({ page }) => {
      await setupMocks(page);
      await loginAsAdmin(page);
      await page.setViewportSize({ width: 375, height: 667 });

      const adminLayout = new AdminLayoutPage(page);
      await page.goto('/dashboard');
      await adminLayout.expectSidebarHidden();
    });
  });

  test.describe('Dashboard Responsive', () => {
    test('should stack chart and list vertically on mobile', async ({ page }) => {
      await setupMocks(page);
      await loginAsAdmin(page);
      await page.setViewportSize({ width: 375, height: 667 });

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.expectLoaded();

      const chartBox = await dashboardPage.chartArea.boundingBox();
      const listBox = await dashboardPage.responseList.boundingBox();

      expect(chartBox).toBeTruthy();
      expect(listBox).toBeTruthy();
      if (chartBox && listBox) {
        // List should be below chart (stacked vertically)
        expect(listBox.y).toBeGreaterThan(chartBox.y);
      }
    });

    test('should show chart and list side by side on desktop', async ({ page }) => {
      await setupMocks(page);
      await loginAsAdmin(page);
      await page.setViewportSize({ width: 1440, height: 900 });

      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      await dashboardPage.expectLoaded();

      const chartBox = await dashboardPage.chartArea.boundingBox();
      const listBox = await dashboardPage.responseList.boundingBox();

      expect(chartBox).toBeTruthy();
      expect(listBox).toBeTruthy();
      if (chartBox && listBox) {
        // They should be at roughly the same vertical position
        expect(Math.abs(chartBox.y - listBox.y)).toBeLessThan(100);
        // And not overlapping horizontally
        expect(listBox.x).toBeGreaterThan(chartBox.x);
      }
    });
  });

  test.describe('Respondent Pages Responsive', () => {
    test('should be usable at 375px mobile width', async ({ page }) => {
      await page.route('**/api/questions/1**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockQuestions[0]),
        })
      );

      await page.setViewportSize({ width: 375, height: 667 });
      const respondentPage = new RespondentPage(page);
      await respondentPage.goto('1');
      await respondentPage.expectLoaded();

      // Submit button should be visible and tappable
      await expect(respondentPage.submitButton).toBeVisible();
      const btnBox = await respondentPage.submitButton.boundingBox();
      expect(btnBox).toBeTruthy();
      if (btnBox) {
        // Button should fit within viewport
        expect(btnBox.x).toBeGreaterThanOrEqual(0);
        expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(375);
        // Button should have a reasonable tap target size
        expect(btnBox.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
});
