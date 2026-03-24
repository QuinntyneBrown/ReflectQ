import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-text-area-field',
  standalone: true,
  imports: [],
  templateUrl: './text-area-field.html',
  styleUrl: './text-area-field.scss',
})
export class TextAreaField {
  @Input() placeholder = 'Type your response here...';
  @Input() maxLength = 500;
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
  }
}
