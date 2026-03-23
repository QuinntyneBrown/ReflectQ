import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-qr-code-frame',
  standalone: true,
  imports: [],
  template: `
    <div
      class="qr-frame"
      [style.width.px]="width"
      [style.height.px]="height"
    >
      <ng-content />
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .qr-frame {
      background-color: #FFFFFF;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
  `,
})
export class QrCodeFrame {
  @Input() width = 420;
  @Input() height = 420;
}
