import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InviteUserRequest, PagedResult, UpdateUserRequest, User } from 'domain';
import { API_CONFIG } from './api-config';

export interface UserListParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG);

  private get baseUrl(): string {
    return `${this.config.baseUrl}/api/users`;
  }

  list(params: UserListParams = {}): Observable<PagedResult<User>> {
    let httpParams = new HttpParams();
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortDirection) httpParams = httpParams.set('sortDirection', params.sortDirection);
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.pageSize != null) httpParams = httpParams.set('pageSize', params.pageSize);

    return this.http.get<PagedResult<User>>(this.baseUrl, { params: httpParams });
  }

  invite(request: InviteUserRequest): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/invite`, request);
  }

  update(id: string, request: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, request);
  }

  deactivate(id: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }
}
