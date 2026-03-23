import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-confirmation-message',
  standalone: true,
  imports: [],
  template: `
    <div class="confirmation">
      <div class="check-circle">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
      <h2 class="title">{{ title }}</h2>
      <p class="description">{{ description }}</p>
      <p class="note">{{ note }}</p>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .confirmation {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
    }

    .check-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: #4CAF50;
    }

    .title {
      margin: 0;
      font-family: 'Inconsolata', monospace;
      font-size: 28px;
      font-weight: 600;
      color: #0D0D0D;
      text-align: center;
    }

    .description {
      margin: 0;
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      color: #7A7A7A;
      text-align: center;
      line-height: 1.5;
      max-width: 280px;
      white-space: pre-line;
    }

    .note {
      margin: 0;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #B0B0B0;
      text-align: center;
    }
  `,
})
export class ConfirmationMessage {
  @Input() title = 'Thank you!';
  @Input() description = 'Your response has been\nrecorded successfully.';
  @Input() note = 'You can close this page now.';
}
