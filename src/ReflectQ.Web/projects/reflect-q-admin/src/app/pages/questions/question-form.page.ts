import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { QuestionsService } from 'api';
import { QuestionType } from 'domain';

@Component({
  selector: 'app-question-form-page',
  imports: [ReactiveFormsModule],
  template: `
    <div class="question-form" data-testid="question-form-page">
      <header class="page-header">
        <h1 class="page-title">{{ isEditMode() ? 'Edit Question' : 'Create Question' }}</h1>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-group">
          <label for="title" class="form-label">Title</label>
          <input
            id="title"
            type="text"
            class="form-input"
            formControlName="title"
            placeholder="Enter question title"
            data-testid="title-input"
          />
          @if (form.controls.title.invalid && form.controls.title.touched) {
            <span class="form-error">Title is required.</span>
          }
        </div>

        <div class="form-group">
          <label for="body" class="form-label">Body</label>
          <textarea
            id="body"
            class="form-textarea"
            formControlName="body"
            placeholder="Optional additional details"
            rows="3"
            data-testid="body-input"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="type" class="form-label">Type</label>
          <select
            id="type"
            class="form-select"
            formControlName="type"
            data-testid="type-select"
          >
            <option value="MultipleChoice">Multiple Choice</option>
            <option value="Rating">Rating</option>
            <option value="FreeText">Free Text</option>
          </select>
        </div>

        @if (form.controls.type.value === 'MultipleChoice') {
          <div class="form-group" data-testid="options-section">
            <label class="form-label">Answer Options</label>
            <div class="options-list" formArrayName="options">
              @for (option of optionsArray.controls; track option; let i = $index) {
                <div class="option-row" [formGroupName]="i">
                  <input
                    type="text"
                    class="form-input option-input"
                    formControlName="text"
                    [placeholder]="'Option ' + (i + 1)"
                    [attr.data-testid]="'option-input-' + i"
                  />
                  <button
                    type="button"
                    class="icon-btn remove-btn"
                    (click)="removeOption(i)"
                    [attr.data-testid]="'remove-option-' + i"
                    aria-label="Remove option"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              }
            </div>
            <button
              type="button"
              class="btn btn-secondary add-option-btn"
              (click)="addOption()"
              data-testid="add-option-button"
            >
              + Add Option
            </button>
          </div>
        }

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="onCancel()" data-testid="cancel-button">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="form.invalid"
            data-testid="save-button"
          >
            {{ isEditMode() ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-title {
      font-family: 'Inconsolata', monospace;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .form-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #16160C1A;
      max-width: 600px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      margin-bottom: 6px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #16160C;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #16160C1A;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #16160C;
      background: #ffffff;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #16160C;
    }

    .form-textarea {
      resize: vertical;
    }

    .form-error {
      display: block;
      margin-top: 4px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: #d32f2f;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 8px;
    }

    .option-row {
      display: flex;
      gap: 8px;
    }

    .option-input {
      flex: 1;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: none;
      border: 1px solid #16160C1A;
      border-radius: 8px;
      cursor: pointer;
      color: #16160C;
    }

    .icon-btn:hover {
      background: #F5F0F0;
    }

    .add-option-btn {
      height: 36px;
      font-size: 13px;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #16160C1A;
    }

    .btn {
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #16160C;
      color: #ffffff;
    }

    .btn-secondary {
      background: #ffffff;
      color: #16160C;
      border: 1px solid #16160C1A;
    }
  `,
})
export class QuestionFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly questionsService = inject(QuestionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEditMode = signal(false);
  private questionId: string | null = null;

  readonly form = this.fb.group({
    title: ['', Validators.required],
    body: [''],
    type: [QuestionType.MultipleChoice as string, Validators.required],
    options: this.fb.array([
      this.fb.group({ text: ['', Validators.required], sortOrder: [0] }),
      this.fb.group({ text: ['', Validators.required], sortOrder: [1] }),
    ]),
  });

  get optionsArray(): FormArray {
    return this.form.controls.options;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.questionId = id;
      this.questionsService.get(id).subscribe((question) => {
        this.form.patchValue({
          title: question.title,
          body: question.body || '',
          type: question.type,
        });

        this.optionsArray.clear();
        for (const opt of question.options) {
          this.optionsArray.push(
            this.fb.group({
              text: [opt.text, Validators.required],
              sortOrder: [opt.sortOrder],
            })
          );
        }
      });
    }
  }

  addOption(): void {
    this.optionsArray.push(
      this.fb.group({
        text: ['', Validators.required],
        sortOrder: [this.optionsArray.length],
      })
    );
  }

  removeOption(index: number): void {
    this.optionsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const options =
      value.type === QuestionType.MultipleChoice
        ? value.options.map((o, i) => ({ text: o.text || '', sortOrder: i }))
        : undefined;

    if (this.isEditMode() && this.questionId) {
      this.questionsService
        .update(this.questionId, {
          title: value.title || undefined,
          body: value.body || undefined,
          type: (value.type as QuestionType) || undefined,
          options,
        })
        .subscribe(() => this.router.navigate(['/questions']));
    } else {
      this.questionsService
        .create({
          title: value.title || '',
          body: value.body || undefined,
          type: (value.type as QuestionType) || QuestionType.MultipleChoice,
          options,
        })
        .subscribe(() => this.router.navigate(['/questions']));
    }
  }

  onCancel(): void {
    this.router.navigate(['/questions']);
  }
}
