import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-submit-button',
  standalone: true,
  imports: [],
  templateUrl: './submit-button.html',
  styleUrl: './submit-button.scss',
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
