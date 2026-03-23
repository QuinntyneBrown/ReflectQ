import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateQuestionRequest,
  PagedResult,
  Question,
  UpdateQuestionRequest,
} from 'domain';
import { API_CONFIG } from './api-config';

export interface QuestionListParams {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  includeArchived?: boolean;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  private get baseUrl(): string {
    return `${this.config.baseUrl}/api/questions`;
  }

  list(params: QuestionListParams = {}): Observable<PagedResult<Question>> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    if (params.includeArchived) httpParams = httpParams.set('includeArchived', 'true');
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);

    return this.http.get<PagedResult<Question>>(this.baseUrl, { params: httpParams });
  }

  get(id: string): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateQuestionRequest): Observable<Question> {
    return this.http.post<Question>(this.baseUrl, request);
  }

  update(id: string, request: UpdateQuestionRequest): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/${id}`, request);
  }

  activate(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/activate`, {});
  }

  archive(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/archive`, {});
  }
}
