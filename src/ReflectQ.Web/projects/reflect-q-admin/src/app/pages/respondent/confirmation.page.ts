import { Component } from '@angular/core';
import { ConfirmationMessage } from 'components';

@Component({
  selector: 'app-confirmation-page',
  imports: [ConfirmationMessage],
  template: `
    <div class="confirmation-wrapper" data-testid="confirmation-page">
      <lib-confirmation-message />
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .confirmation-wrapper {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
    }
  `,
})
export class ConfirmationPage {}
