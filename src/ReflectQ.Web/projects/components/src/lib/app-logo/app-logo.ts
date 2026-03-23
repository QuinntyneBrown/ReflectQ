import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'lib-app-logo',
  standalone: true,
  imports: [],
  template: `
    <div class="logo" [class.sm]="size === 'sm'" [class.lg]="size === 'lg'">
      <div class="logo-box">Q</div>
      <span class="logo-text" [class.light]="theme === 'light'">ReflectQ</span>
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .logo {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .logo.sm {
      gap: 8px;
    }

    .logo.lg {
      gap: 10px;
    }

    .logo-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #16160C;
      border-radius: 6px;
      color: #FFFFFF;
      font-family: 'Inconsolata', monospace;
      font-weight: 600;
    }

    .sm .logo-box {
      width: 28px;
      height: 28px;
      font-size: 16px;
    }

    .lg .logo-box {
      width: 36px;
      height: 36px;
      font-size: 20px;
    }

    .logo-text {
      font-family: 'Inconsolata', monospace;
      font-weight: 600;
      color: #0D0D0D;
    }

    .logo-text.light {
      color: #FFFFFF;
    }

    .sm .logo-text {
      font-size: 16px;
    }

    .lg .logo-text {
      font-size: 20px;
    }
  `,
})
export class AppLogo {
  @Input() theme: 'light' | 'dark' = 'dark';
  @Input() size: 'sm' | 'lg' = 'sm';
}
