import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuestionResponse, SubmitResponseRequest } from 'domain';
import { API_CONFIG } from './api-config';

@Injectable({ providedIn: 'root' })
export class ResponsesService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  submit(request: SubmitResponseRequest): Observable<QuestionResponse> {
    return this.http.post<QuestionResponse>(`${this.config.baseUrl}/api/responses`, request);
  }

  listForQuestion(questionId: string): Observable<QuestionResponse[]> {
    return this.http.get<QuestionResponse[]>(
      `${this.config.baseUrl}/api/questions/${questionId}/responses`,
    );
  }

  clearForQuestion(questionId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.config.baseUrl}/api/questions/${questionId}/responses`,
    );
  }

  exportCsv(questionId: string): Observable<Blob> {
    return this.http.get(`${this.config.baseUrl}/api/questions/${questionId}/responses/export`, {
      responseType: 'blob',
    });
  }
}
