import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { QuestionsService } from 'api';
import { QuestionType } from 'domain';

@Component({
  selector: 'app-question-form-page',
  imports: [ReactiveFormsModule],
  templateUrl: './question-form.page.html',
  styleUrl: './question-form.page.scss',
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
