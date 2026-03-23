import { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('reflectq_token', 'mock-jwt-token-for-testing');
  });
}
