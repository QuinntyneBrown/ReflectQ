import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { QuestionsService } from 'api';
import { Question, QuestionStatus } from 'domain';

@Component({
  selector: 'app-question-list-page',
  imports: [FormsModule, DatePipe],
  templateUrl: './question-list.page.html',
  styleUrl: './question-list.page.scss',
})
export class QuestionListPage implements OnInit {
  private readonly questionsService = inject(QuestionsService);
  private readonly router = inject(Router);

  readonly questions = signal<Question[]>([]);
  readonly search = signal('');
  readonly statusFilter = signal('');
  readonly showArchived = signal(false);

  ngOnInit(): void {
    this.loadQuestions();
  }

  onSearchChange(value: string): void {
    this.search.set(value);
    this.loadQuestions();
  }

  onStatusFilterChange(value: string): void {
    this.statusFilter.set(value);
    this.loadQuestions();
  }

  onShowArchivedChange(value: boolean): void {
    this.showArchived.set(value);
    this.loadQuestions();
  }

  onNewQuestion(): void {
    this.router.navigate(['/questions/new']);
  }

  onEdit(question: Question): void {
    this.router.navigate(['/questions', question.id, 'edit']);
  }

  onActivate(question: Question): void {
    this.questionsService.activate(question.id).subscribe(() => {
      this.loadQuestions();
    });
  }

  private loadQuestions(): void {
    this.questionsService
      .list({
        search: this.search() || undefined,
        includeArchived: this.showArchived(),
      })
      .subscribe((result) => {
        let items = result.items;
        const filter = this.statusFilter();
        if (filter) {
          items = items.filter((q) => q.status === filter);
        }
        this.questions.set(items);
      });
  }
}
