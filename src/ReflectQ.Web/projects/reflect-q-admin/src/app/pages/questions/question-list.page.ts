import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { QuestionsService } from 'api';
import { Question, QuestionStatus } from 'domain';

@Component({
  selector: 'app-question-list-page',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="question-list" data-testid="question-list-page">
      <header class="page-header">
        <h1 class="page-title">Questions</h1>
        <button class="btn btn-primary" (click)="onNewQuestion()" data-testid="new-question-button">
          New Question
        </button>
      </header>

      <div class="filters">
        <input
          type="text"
          class="search-input"
          placeholder="Search questions..."
          [ngModel]="search()"
          (ngModelChange)="onSearchChange($event)"
          data-testid="search-input"
        />
        <select
          class="filter-select"
          [ngModel]="statusFilter()"
          (ngModelChange)="onStatusFilterChange($event)"
          data-testid="status-filter"
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Active">Active</option>
          <option value="Archived">Archived</option>
        </select>
        <label class="toggle-label">
          <input
            type="checkbox"
            [ngModel]="showArchived()"
            (ngModelChange)="onShowArchivedChange($event)"
            data-testid="show-archived-toggle"
          />
          <span>Show Archived</span>
        </label>
      </div>

      <div class="table-container">
        <table class="data-table" data-testid="questions-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (question of questions(); track question.id) {
              <tr data-testid="question-row">
                <td>{{ question.title }}</td>
                <td>{{ question.type }}</td>
                <td>
                  <span class="badge" [class]="'badge-' + question.status.toLowerCase()">
                    {{ question.status }}
                  </span>
                </td>
                <td>{{ question.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="actions">
                    @if (question.status !== 'Active') {
                      <button
                        class="icon-btn"
                        title="Activate"
                        (click)="onActivate(question)"
                        data-testid="activate-button"
                        aria-label="Activate question"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                    }
                    <button
                      class="icon-btn"
                      title="Edit"
                      (click)="onEdit(question)"
                      data-testid="edit-button"
                      aria-label="Edit question"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="empty-cell">No questions found.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .page-title {
      font-family: 'Inconsolata', monospace;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
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

    .btn-primary {
      background: #16160C;
      color: #ffffff;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    .filters {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .search-input {
      flex: 1;
      height: 40px;
      padding: 0 14px;
      border: 1px solid #16160C1A;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      background: #ffffff;
      color: #16160C;
    }

    .search-input:focus {
      outline: none;
      border-color: #16160C;
    }

    .filter-select {
      height: 40px;
      padding: 0 14px;
      border: 1px solid #16160C1A;
      border-radius: 8px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      background: #ffffff;
      color: #16160C;
      cursor: pointer;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #7A7A7A;
      cursor: pointer;
      white-space: nowrap;
    }

    .table-container {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #16160C1A;
      overflow: hidden;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      text-align: left;
      padding: 12px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #7A7A7A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #16160C1A;
    }

    .data-table td {
      padding: 12px 16px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #16160C;
      border-bottom: 1px solid #16160C0D;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge-draft {
      background: #F5F0F0;
      color: #7A7A7A;
    }

    .badge-active {
      background: #4A7C59;
      color: #ffffff;
    }

    .badge-archived {
      background: #16160C1A;
      color: #16160C;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: none;
      border: 1px solid #16160C1A;
      border-radius: 6px;
      cursor: pointer;
      color: #16160C;
    }

    .icon-btn:hover {
      background: #F5F0F0;
    }

    .empty-cell {
      text-align: center;
      color: #7A7A7A;
      padding: 32px 16px !important;
    }
  `,
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
