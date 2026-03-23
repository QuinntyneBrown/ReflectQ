import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-option-card',
  standalone: true,
  imports: [],
  template: `
    <button
      class="option-card"
      [class.selected]="selected"
      (click)="selectedChange.emit()"
      type="button"
    >
      <span class="radio"></span>
      <span class="text">{{ text }}</span>
    </button>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .option-card {
      display: flex;
      align-items: center;
      width: 100%;
      height: 52px;
      padding: 0 16px;
      border-radius: 8px;
      background: #F5F0F0;
      border: 1px solid #E8E8E8;
      gap: 12px;
      cursor: pointer;
      box-sizing: border-box;
    }

    .option-card.selected {
      background: #16160C;
      border: 1px solid #16160C;
    }

    .radio {
      display: inline-block;
      width: 20px;
      height: 20px;
      min-width: 20px;
      border-radius: 50%;
      border: 2px solid #E8E8E8;
      background: transparent;
      box-sizing: border-box;
    }

    .selected .radio {
      border-color: #FFFFFF;
      background: #FFFFFF;
    }

    .text {
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      color: #0D0D0D;
    }

    .selected .text {
      color: #FFFFFF;
      font-weight: 500;
    }
  `,
})
export class OptionCard {
  @Input() text = '';
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<void>();
}
