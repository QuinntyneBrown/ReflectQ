import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { AdminLayoutPage } from '../pages/admin-layout.page';
import { loginAsAdmin } from '../helpers/auth.helper';
import { mockDashboard, mockCurrentUser } from '../fixtures/mock-data';

test.describe('Dashboard Page', () => {
  let dashboardPage: DashboardPage;
  let adminLayout: AdminLayoutPage;

  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/dashboard**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockDashboard),
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
    dashboardPage = new DashboardPage(page);
    adminLayout = new AdminLayoutPage(page);
    await dashboardPage.goto();
  });

  test('should show sidebar and dashboard content', async () => {
    await adminLayout.expectSidebarVisible();
    await dashboardPage.expectLoaded();
  });

  test('should display active question card', async () => {
    await expect(dashboardPage.activeQuestionCard).toBeVisible();
  });

  test('should display chart area', async () => {
    await dashboardPage.expectChartVisible();
  });

  test('should display response list', async () => {
    await dashboardPage.expectResponseListVisible();
  });

  test('should display Export CSV and Reset buttons', async () => {
    await expect(dashboardPage.exportCsvButton).toBeVisible();
    await expect(dashboardPage.resetButton).toBeVisible();
  });

  test('should display Presenter View button', async () => {
    await expect(dashboardPage.presenterViewButton).toBeVisible();
  });

  test('should show response count', async () => {
    await expect(dashboardPage.responseCount).toBeVisible();
  });

  test('should have chart and list side by side on desktop', async ({ page }) => {
    const viewportSize = page.viewportSize();
    if (viewportSize && viewportSize.width >= 1024) {
      const chartBox = await dashboardPage.chartArea.boundingBox();
      const listBox = await dashboardPage.responseList.boundingBox();
      expect(chartBox).toBeTruthy();
      expect(listBox).toBeTruthy();
      if (chartBox && listBox) {
        // They should be roughly at the same Y position (side by side)
        expect(Math.abs(chartBox.y - listBox.y)).toBeLessThan(100);
      }
    }
  });

  test('should stack chart and list vertically on mobile', async ({ page }) => {
    const viewportSize = page.viewportSize();
    if (viewportSize && viewportSize.width < 768) {
      const chartBox = await dashboardPage.chartArea.boundingBox();
      const listBox = await dashboardPage.responseList.boundingBox();
      expect(chartBox).toBeTruthy();
      expect(listBox).toBeTruthy();
      if (chartBox && listBox) {
        // List should be below chart
        expect(listBox.y).toBeGreaterThan(chartBox.y + chartBox.height - 20);
      }
    }
  });

  test('should use correct font families on key elements', async () => {
    const countFont = await dashboardPage.responseCount.evaluate((el) =>
      getComputedStyle(el).fontFamily
    );
    expect(countFont.toLowerCase()).toMatch(/inconsolata/);
  });
});
