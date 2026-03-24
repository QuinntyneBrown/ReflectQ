import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLogo } from 'components';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sign-in-page',
  imports: [AppLogo],
  template: `
    <div class="sign-in" data-testid="sign-in-page">
      <div class="sign-in__left">
        <div class="sign-in__left-content">
          <lib-app-logo size="lg" theme="dark" />
          <p class="sign-in__tagline">Real-time audience engagement for meaningful conversations.</p>
          <button class="sign-in__button" (click)="onSignIn()" data-testid="sign-in-button">
            Sign In
          </button>
        </div>
      </div>
      <div class="sign-in__right">
        <div class="sign-in__right-content">
          <h1 class="sign-in__hero-text">Empower your<br />community with<br />thoughtful questions.</h1>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .sign-in {
      display: flex;
      height: 100%;
    }

    .sign-in__left {
      flex: 1;
      background: #F5F0F0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sign-in__left-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
      max-width: 320px;
    }

    .sign-in__tagline {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      color: #7A7A7A;
      line-height: 1.5;
      margin: 0;
    }

    .sign-in__button {
      height: 48px;
      padding: 0 32px;
      background: #16160C;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-family: 'Inconsolata', monospace;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }

    .sign-in__button:hover {
      opacity: 0.9;
    }

    .sign-in__right {
      flex: 1;
      background: #16160C;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sign-in__right-content {
      max-width: 400px;
      padding: 40px;
    }

    .sign-in__hero-text {
      font-family: 'Inconsolata', monospace;
      font-size: 36px;
      font-weight: 600;
      color: #ffffff;
      line-height: 1.3;
      margin: 0;
    }
  `,
})
export class SignInPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSignIn(): void {
    this.authService.signIn();
    this.router.navigate(['/dashboard']);
  }
}
