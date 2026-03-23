import { type Page, type Locator, expect } from '@playwright/test';

export class SignInPage {
  readonly page: Page;
  readonly container: Locator;
  readonly logo: Locator;
  readonly signInButton: Locator;
  readonly hero: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('sign-in-page');
    this.logo = page.getByTestId('sign-in-logo');
    this.signInButton = page.getByTestId('sign-in-button');
    this.hero = page.getByTestId('sign-in-hero');
  }

  async goto() {
    await this.page.goto('/sign-in');
  }

  async signIn() {
    await this.signInButton.click();
  }

  async expectLoaded() {
    await expect(this.container).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async expectHeroVisible() {
    await expect(this.hero).toBeVisible();
  }

  async expectLogoFont(fontFamily: string) {
    await expect(this.logo).toHaveCSS('font-family', new RegExp(fontFamily, 'i'));
  }

  async expectButtonRadius(radius: string) {
    await expect(this.signInButton).toHaveCSS('border-radius', radius);
  }
}
