import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-question-text',
  standalone: true,
  imports: [],
  templateUrl: './question-text.html',
  styleUrl: './question-text.scss',
})
export class QuestionText {
  @Input() text = '';
}
