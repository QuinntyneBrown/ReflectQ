import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-question-text',
  standalone: true,
  imports: [],
  template: `
    <h2 class="question-text">{{ text }}</h2>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .question-text {
      margin: 0;
      font-family: 'Inconsolata', monospace;
      font-size: 22px;
      font-weight: 500;
      color: #0D0D0D;
      line-height: 1.3;
      letter-spacing: -0.5px;
    }
  `,
})
export class QuestionText {
  @Input() text = '';
}
