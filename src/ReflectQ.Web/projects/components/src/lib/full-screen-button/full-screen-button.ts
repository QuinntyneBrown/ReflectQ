import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'lib-full-screen-button',
  standalone: true,
  imports: [],
  template: `
    <button class="fullscreen-btn" (click)="toggle.emit()">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 6V2H6M10 2H14V6M14 10V14H10M6 14H2V10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Full Screen</span>
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .fullscreen-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 40px;
      padding: 0 20px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.33);
      border-radius: 8px;
      cursor: pointer;
      color: #FFFFFF;
      transition: border-color 0.2s ease;
    }

    .fullscreen-btn:hover {
      border-color: rgba(255, 255, 255, 0.4);
    }

    .fullscreen-btn span {
      font-family: 'Inconsolata', monospace;
      font-size: 13px;
      font-weight: 500;
      color: #FFFFFF;
    }
  `,
})
export class FullScreenButton {
  @Output() toggle = new EventEmitter<void>();
}
