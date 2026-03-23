import { inject, Injectable, OnDestroy } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { QuestionResponse } from 'domain';
import { API_CONFIG } from './api-config';

export interface ResponseCountUpdate {
  questionId: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class ResponseHubService implements OnDestroy {
  private readonly config = inject(API_CONFIG);
  private connection: signalR.HubConnection | null = null;

  private readonly responseReceived$ = new Subject<QuestionResponse>();
  private readonly responseCountUpdated$ = new Subject<ResponseCountUpdate>();
  private readonly connected$ = new Subject<boolean>();

  get onResponseReceived(): Observable<QuestionResponse> {
    return this.responseReceived$.asObservable();
  }

  get onResponseCountUpdated(): Observable<ResponseCountUpdate> {
    return this.responseCountUpdated$.asObservable();
  }

  get onConnectionChanged(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  async start(): Promise<void> {
    if (this.connection) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.config.baseUrl}/hubs/responses`)
      .withAutomaticReconnect()
      .build();

    this.connection.on('ResponseReceived', (response: QuestionResponse) => {
      this.responseReceived$.next(response);
    });

    this.connection.on('ResponseCountUpdated', (update: ResponseCountUpdate) => {
      this.responseCountUpdated$.next(update);
    });

    this.connection.onreconnected(() => this.connected$.next(true));
    this.connection.onclose(() => this.connected$.next(false));

    await this.connection.start();
    this.connected$.next(true);
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connected$.next(false);
    }
  }

  ngOnDestroy(): void {
    this.stop();
    this.responseReceived$.complete();
    this.responseCountUpdated$.complete();
    this.connected$.complete();
  }
}
