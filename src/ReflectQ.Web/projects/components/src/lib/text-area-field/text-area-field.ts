import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-text-area-field',
  standalone: true,
  imports: [],
  template: `
    <div class="field">
      <textarea
        class="textarea"
        [placeholder]="placeholder"
        [maxLength]="maxLength"
        [value]="value"
        (input)="onInput($event)"
      ></textarea>
      <span class="char-count">{{ value.length }} / {{ maxLength }} characters</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .field {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .textarea {
      width: 100%;
      height: 180px;
      padding: 16px;
      background: #F5F0F0;
      border: 1px solid #E8E8E8;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      color: #0D0D0D;
      resize: vertical;
      box-sizing: border-box;
    }

    .textarea::placeholder {
      color: #B0B0B0;
    }

    .textarea:focus {
      outline: none;
      border-color: #16160C;
    }

    .char-count {
      margin-top: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: #B0B0B0;
    }
  `,
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
