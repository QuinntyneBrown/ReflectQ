import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppLogo, QuestionText, OptionCard, StarRating, TextAreaField, SubmitButton } from 'components';
import { QuestionsService, ResponsesService } from 'api';
import { Question, QuestionType } from 'domain';

@Component({
  selector: 'app-respondent-page',
  imports: [AppLogo, QuestionText, OptionCard, StarRating, TextAreaField, SubmitButton],
  template: `
    <div class="respondent" data-testid="respondent-page">
      @if (question(); as q) {
        <div class="respondent-content">
          <div class="top-section">
            <lib-app-logo size="sm" theme="dark" />
            <lib-question-text [text]="q.title" />
          </div>

          <div class="input-section">
            @switch (q.type) {
              @case ('MultipleChoice') {
                <div class="options" data-testid="options-list">
                  @for (option of q.options; track option.id) {
                    <lib-option-card
                      [text]="option.text"
                      [selected]="selectedValue() === option.text"
                      (selectedChange)="selectedValue.set(option.text)"
                    />
                  }
                </div>
              }
              @case ('Rating') {
                <lib-star-rating
                  [value]="ratingValue()"
                  (ratingChange)="onRatingChange($event)"
                  data-testid="star-rating"
                />
              }
              @case ('FreeText') {
                <lib-text-area-field
                  [value]="textValue()"
                  (valueChange)="textValue.set($event)"
                  data-testid="text-area"
                />
              }
            }
          </div>

          <div class="bottom-section">
            <lib-submit-button
              [disabled]="!canSubmit()"
              (submitClick)="onSubmit()"
              data-testid="submit-button"
            />
          </div>
        </div>
      } @else {
        <div class="loading">
          <p>Loading...</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .respondent {
      height: 100%;
      background: #ffffff;
      display: flex;
      justify-content: center;
    }

    .respondent-content {
      width: 100%;
      max-width: 480px;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .top-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;
    }

    .input-section {
      flex: 1;
    }

    .options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bottom-section {
      padding-top: 24px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-family: 'DM Sans', sans-serif;
      color: #7A7A7A;
    }
  `,
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
