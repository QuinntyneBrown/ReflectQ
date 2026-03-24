import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppLogo, QrCodeFrame, ResponseCounter, FullScreenButton } from 'components';
import { QuestionsService, ResponseHubService } from 'api';
import { Question } from 'domain';

@Component({
  selector: 'app-presenter-page',
  imports: [AppLogo, QrCodeFrame, ResponseCounter, FullScreenButton],
  templateUrl: './presenter.page.html',
  styleUrl: './presenter.page.scss',
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
