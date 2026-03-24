import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { QuestionsService, ResponsesService, ResponseHubService } from 'api';
import { Question, QuestionResponse, QuestionStatus } from 'domain';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
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
