import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-submit-button',
  standalone: true,
  imports: [],
  template: `
    <button
      class="submit-btn"
      [class.is-disabled]="disabled"
      [disabled]="disabled"
      (click)="onClick()"
      type="button"
    >
      {{ label }}
    </button>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .submit-btn {
      width: 100%;
      height: 52px;
      border: none;
      border-radius: 8px;
      background: #16160C;
      color: #FFFFFF;
      font-family: 'Inconsolata', monospace;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
    }

    .submit-btn.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class SubmitButton {
  @Input() disabled = false;
  @Input() label = 'Submit';
  @Output() submitClick = new EventEmitter<void>();

  onClick(): void {
    if (!this.disabled) {
      this.submitClick.emit();
    }
  }
}
