import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-qr-code-frame',
  standalone: true,
  imports: [],
  templateUrl: './qr-code-frame.html',
  styleUrl: './qr-code-frame.scss',
})
export class QrCodeFrame {
  @Input() width = 420;
  @Input() height = 420;
}
