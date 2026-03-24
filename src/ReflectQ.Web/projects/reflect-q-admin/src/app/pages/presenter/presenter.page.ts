import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppLogo, QrCodeFrame, ResponseCounter, FullScreenButton } from 'components';
import { QuestionsService, ResponseHubService } from 'api';
import { Question } from 'domain';

@Component({
  selector: 'app-presenter-page',
  imports: [AppLogo, QrCodeFrame, ResponseCounter, FullScreenButton],
  template: `
    <div class="presenter" data-testid="presenter-page">
      <header class="presenter__header">
        <lib-app-logo size="lg" theme="light" />
        <lib-full-screen-button (toggle)="onToggleFullScreen()" />
      </header>

      @if (question(); as q) {
        <div class="presenter__content">
          <h1 class="presenter__question">{{ q.title }}</h1>

          <div class="presenter__info">
            <lib-qr-code-frame [width]="320" [height]="320">
              <p class="presenter__qr-placeholder">Scan to respond</p>
            </lib-qr-code-frame>

            <lib-response-counter [count]="responseCount()" />
          </div>
        </div>
      } @else {
        <div class="presenter--loading">
          <p>Loading question...</p>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100vh;
    }

    .presenter {
      height: 100%;
      background: #16160C;
      display: flex;
      flex-direction: column;
      padding: 32px 48px;
    }

    .presenter__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .presenter__content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 48px;
    }

    .presenter__question {
      font-family: 'Inconsolata', monospace;
      font-size: 32px;
      font-weight: 600;
      color: #ffffff;
      text-align: center;
      margin: 0;
      max-width: 700px;
    }

    .presenter__info {
      display: flex;
      align-items: center;
      gap: 64px;
    }

    .presenter__qr-placeholder {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #7A7A7A;
      text-align: center;
      margin: 0;
    }

    .presenter--loading {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.5);
      font-family: 'DM Sans', sans-serif;
    }
  `,
})
export class PresenterPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly questionsService = inject(QuestionsService);
  private readonly responseHubService = inject(ResponseHubService);

  private subscriptions = new Subscription();

  readonly question = signal<Question | null>(null);
  readonly responseCount = signal(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.questionsService.get(id).subscribe((q) => this.question.set(q));

    this.responseHubService.start();

    this.subscriptions.add(
      this.responseHubService.onResponseCountUpdated.subscribe((update) => {
        if (update.questionId === id) {
          this.responseCount.set(update.count);
        }
      })
    );

    this.subscriptions.add(
      this.responseHubService.onResponseReceived.subscribe(() => {
        this.responseCount.update((c) => c + 1);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.responseHubService.stop();
  }

  onToggleFullScreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
}
