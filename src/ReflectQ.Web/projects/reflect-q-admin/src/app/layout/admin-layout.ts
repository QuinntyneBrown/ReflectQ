import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppLogo } from 'components';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppLogo],
  template: `
    <div class="admin-layout" data-testid="admin-layout">
      <aside class="admin-layout__sidebar" role="navigation" aria-label="Main navigation">
        <div class="admin-layout__sidebar-top">
          <div class="admin-layout__logo">
            <lib-app-logo size="sm" theme="dark" />
          </div>
          <nav class="admin-layout__nav">
            <a
              class="admin-layout__nav-item"
              routerLink="/dashboard"
              [routerLinkActive]="'admin-layout__nav-item--active'"
              data-testid="nav-dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span>Dashboard</span>
            </a>
            <a
              class="admin-layout__nav-item"
              routerLink="/questions"
              [routerLinkActive]="'admin-layout__nav-item--active'"
              data-testid="nav-questions"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              <span>Questions</span>
            </a>
            <a
              class="admin-layout__nav-item"
              routerLink="/users"
              [routerLinkActive]="'admin-layout__nav-item--active'"
              data-testid="nav-users"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Users</span>
            </a>
          </nav>
        </div>
        <div class="admin-layout__sidebar-bottom">
          <button class="admin-layout__sign-out" (click)="onSignOut()" data-testid="sign-out-button">
            Sign Out
          </button>
        </div>
      </aside>
      <main class="admin-layout__content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .admin-layout {
      display: flex;
      height: 100vh;
    }

    .admin-layout__sidebar {
      width: 240px;
      min-width: 240px;
      background: #ffffff;
      border-right: 1px solid #16160C1A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .admin-layout__sidebar-top {
      display: flex;
      flex-direction: column;
    }

    .admin-layout__logo {
      padding: 20px 20px 24px;
    }

    .admin-layout__nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 0 8px;
    }

    .admin-layout__nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 6px;
      text-decoration: none;
      color: #16160C;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.15s ease;
    }

    .admin-layout__nav-item:hover {
      background-color: #F5F0F0;
    }

    .admin-layout__nav-item--active {
      background-color: #F5F0F0;
    }

    .admin-layout__sidebar-bottom {
      padding: 16px 20px;
      border-top: 1px solid #16160C1A;
    }

    .admin-layout__sign-out {
      background: none;
      border: none;
      color: #16160C;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      cursor: pointer;
      padding: 4px 0;
      opacity: 0.6;
    }

    .admin-layout__sign-out:hover {
      opacity: 1;
    }

    .admin-layout__content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
    }
  `,
})
export class AdminLayout {
  private readonly authService = inject(AuthService);

  onSignOut(): void {
    this.authService.signOut();
  }
}
