import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-response-counter',
  standalone: true,
  imports: [],
  template: `
    <div class="counter-container">
      <span class="count">{{ count }}</span>
      <div class="labels">
        <span class="responses-label">responses</span>
        <div class="live-indicator">
          <span class="live-dot"></span>
          <span class="live-text">Live</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .counter-container {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      gap: 16px;
    }

    .count {
      font-family: 'Inconsolata', monospace;
      font-size: 72px;
      font-weight: 600;
      color: #C4956A;
      letter-spacing: -1px;
      line-height: 1;
    }

    .labels {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-bottom: 8px;
    }

    .responses-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.5);
    }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #4CAF50;
      display: inline-block;
      animation: pulse 2s ease-in-out infinite;
    }

    .live-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(0.85);
      }
    }
  `,
})
export class ResponseCounter {
  @Input() count = 0;
}
