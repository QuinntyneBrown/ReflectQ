import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { QuestionsService, ResponsesService, ResponseHubService } from 'api';
import { Question, QuestionResponse, QuestionStatus } from 'domain';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe],
  template: `
    <div class="dashboard" data-testid="dashboard-page">
      <header class="dashboard__header">
        <h1 class="dashboard__title">Live Dashboard</h1>
        <div class="dashboard__actions">
          <button
            class="btn btn--secondary"
            (click)="onExportCsv()"
            [disabled]="!activeQuestion()"
            data-testid="export-csv-button"
          >
            Export CSV
          </button>
          <button
            class="btn btn--secondary"
            (click)="onReset()"
            [disabled]="!activeQuestion()"
            data-testid="reset-button"
          >
            Reset
          </button>
        </div>
      </header>

      @if (activeQuestion(); as question) {
        <div class="dashboard__question-card" data-testid="active-question-card">
          <div class="dashboard__card-header">
            <span class="badge badge--active">Active</span>
            <span class="dashboard__question-type">{{ question.type }}</span>
          </div>
          <h2 class="dashboard__question-title">{{ question.title }}</h2>
          <div class="dashboard__card-footer">
            <span class="dashboard__response-count">{{ responseCount() }} responses</span>
            <button
              class="btn btn--primary"
              (click)="onPresenterView(question.id)"
              data-testid="presenter-view-button"
            >
              Presenter View
            </button>
          </div>
        </div>

        <div class="dashboard__grid">
          <div class="dashboard__chart" data-testid="chart-section">
            <h3 class="dashboard__section-title">Response Distribution</h3>
            <div class="bar-chart">
              @for (entry of chartData(); track entry.label) {
                <div class="bar-chart__row">
                  <span class="bar-chart__label">{{ entry.label }}</span>
                  <div class="bar-chart__track">
                    <div class="bar-chart__fill" [style.width.%]="entry.percent"></div>
                  </div>
                  <span class="bar-chart__value">{{ entry.count }}</span>
                </div>
              }
            </div>
          </div>
          <div class="dashboard__responses" data-testid="responses-section">
            <h3 class="dashboard__section-title">Recent Responses</h3>
            <div class="response-list">
              @for (response of responses(); track response.id) {
                <div class="response-list__item">
                  <span class="response-list__value">{{ response.value }}</span>
                  <span class="response-list__time">{{ response.submittedAt | date:'short' }}</span>
                </div>
              } @empty {
                <p class="dashboard__empty">No responses yet.</p>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="dashboard__empty-state" data-testid="empty-state">
          <p>No active question. Activate a question from the Questions page to get started.</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .dashboard__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .dashboard__title {
      font-family: 'Inconsolata', monospace;
      font-size: 24px;
      font-weight: 600;
      margin: 0;
    }

    .dashboard__actions {
      display: flex;
      gap: 8px;
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
      transition: opacity 0.15s ease;
    }

    .btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn--primary {
      background: #16160C;
      color: #ffffff;
    }

    .btn--secondary {
      background: #ffffff;
      color: #16160C;
      border: 1px solid #16160C1A;
    }

    .btn:hover:not(:disabled) {
      opacity: 0.85;
    }

    .dashboard__question-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #16160C1A;
      margin-bottom: 24px;
    }

    .dashboard__card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
    }

    .badge--active {
      background: #4A7C59;
      color: #ffffff;
    }

    .dashboard__question-type {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: #7A7A7A;
    }

    .dashboard__question-title {
      font-family: 'Inconsolata', monospace;
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .dashboard__card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .dashboard__response-count {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #7A7A7A;
    }

    .dashboard__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .dashboard__chart,
    .dashboard__responses {
      background: #ffffff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #16160C1A;
    }

    .dashboard__section-title {
      font-family: 'Inconsolata', monospace;
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .bar-chart {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bar-chart__row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bar-chart__label {
      width: 100px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #16160C;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-chart__track {
      flex: 1;
      height: 24px;
      background: #F5F0F0;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-chart__fill {
      height: 100%;
      background: #C4956A;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .bar-chart__value {
      width: 32px;
      text-align: right;
      font-family: 'Inconsolata', monospace;
      font-size: 14px;
      font-weight: 600;
    }

    .response-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 400px;
      overflow-y: auto;
    }

    .response-list__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: #F5F0F0;
      border-radius: 6px;
    }

    .response-list__value {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #16160C;
    }

    .response-list__time {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: #7A7A7A;
      white-space: nowrap;
    }

    .dashboard__empty {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #7A7A7A;
    }

    .dashboard__empty-state {
      background: #ffffff;
      border-radius: 12px;
      padding: 48px;
      border: 1px solid #16160C1A;
      text-align: center;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #7A7A7A;
    }
  `,
})
export class DashboardPage implements OnInit, OnDestroy {
  private readonly questionsService = inject(QuestionsService);
  private readonly responsesService = inject(ResponsesService);
  private readonly responseHubService = inject(ResponseHubService);
  private readonly router = inject(Router);

  private subscriptions = new Subscription();

  readonly activeQuestion = signal<Question | null>(null);
  readonly responses = signal<QuestionResponse[]>([]);
  readonly responseCount = signal(0);
  readonly chartData = signal<{ label: string; count: number; percent: number }[]>([]);

  ngOnInit(): void {
    this.loadActiveQuestion();

    this.responseHubService.start();

    this.subscriptions.add(
      this.responseHubService.onResponseReceived.subscribe((response) => {
        this.responses.update((list) => [response, ...list]);
        this.responseCount.update((c) => c + 1);
        this.buildChart();
      })
    );

    this.subscriptions.add(
      this.responseHubService.onResponseCountUpdated.subscribe((update) => {
        const q = this.activeQuestion();
        if (q && update.questionId === q.id) {
          this.responseCount.set(update.count);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.responseHubService.stop();
  }

  onPresenterView(questionId: string): void {
    this.router.navigate(['/present', questionId]);
  }

  onExportCsv(): void {
    const question = this.activeQuestion();
    if (!question) return;

    this.responsesService.exportCsv(question.id).subscribe((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `responses-${question.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  onReset(): void {
    const question = this.activeQuestion();
    if (!question) return;

    if (confirm('Are you sure you want to reset all responses for this question?')) {
      this.responsesService.clearForQuestion(question.id).subscribe(() => {
        this.responses.set([]);
        this.responseCount.set(0);
        this.chartData.set([]);
      });
    }
  }

  private loadActiveQuestion(): void {
    this.questionsService.list({ pageSize: 100 }).subscribe((result) => {
      const active = result.items.find((q) => q.status === QuestionStatus.Active);
      if (active) {
        this.activeQuestion.set(active);
        this.loadResponses(active.id);
      }
    });
  }

  private loadResponses(questionId: string): void {
    this.responsesService.listForQuestion(questionId).subscribe((responses) => {
      this.responses.set(responses);
      this.responseCount.set(responses.length);
      this.buildChart();
    });
  }

  private buildChart(): void {
    const responses = this.responses();
    const counts = new Map<string, number>();
    for (const r of responses) {
      counts.set(r.value, (counts.get(r.value) || 0) + 1);
    }
    const max = Math.max(...counts.values(), 1);
    this.chartData.set(
      Array.from(counts.entries()).map(([label, count]) => ({
        label,
        count,
        percent: (count / max) * 100,
      }))
    );
  }
}
