import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLogo, QuestionText, OptionCard, StarRating, TextAreaField, SubmitButton } from 'components';
import { QuestionsService, ResponsesService } from 'api';
import { Question, QuestionType } from 'domain';

@Component({
  selector: 'app-respondent-page',
  imports: [AppLogo, QuestionText, OptionCard, StarRating, TextAreaField, SubmitButton],
  templateUrl: './respondent.page.html',
  styleUrl: './respondent.page.scss',
})
export class RespondentPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly questionsService = inject(QuestionsService);
  private readonly responsesService = inject(ResponsesService);

  readonly question = signal<Question | null>(null);
  readonly selectedValue = signal('');
  readonly ratingValue = signal(0);
  readonly textValue = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.questionsService.get(id).subscribe((q) => this.question.set(q));
  }

  onRatingChange(value: number): void {
    this.ratingValue.set(value);
    this.selectedValue.set(String(value));
  }

  canSubmit(): boolean {
    const q = this.question();
    if (!q) return false;

    switch (q.type) {
      case QuestionType.MultipleChoice:
        return !!this.selectedValue();
      case QuestionType.Rating:
        return this.ratingValue() > 0;
      case QuestionType.FreeText:
        return !!this.textValue().trim();
      default:
        return false;
    }
  }

  onSubmit(): void {
    const q = this.question();
    if (!q) return;

    let value: string;
    switch (q.type) {
      case QuestionType.MultipleChoice:
        value = this.selectedValue();
        break;
      case QuestionType.Rating:
        value = String(this.ratingValue());
        break;
      case QuestionType.FreeText:
        value = this.textValue();
        break;
      default:
        return;
    }

    this.responsesService
      .submit({ questionId: q.id, value })
      .subscribe(() => {
        this.router.navigate(['/respond', q.id, 'confirmation']);
      });
  }
}
