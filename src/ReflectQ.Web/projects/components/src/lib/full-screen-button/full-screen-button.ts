import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'lib-full-screen-button',
  standalone: true,
  imports: [],
  templateUrl: './full-screen-button.html',
  styleUrl: './full-screen-button.scss',
})
export class FullScreenButton {
  @Output() toggle = new EventEmitter<void>();
}
