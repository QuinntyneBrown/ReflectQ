import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'reflectq_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  signIn(): void {
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIFVzZXIiLCJyb2xlIjoiQWRtaW4ifQ.mock';
    localStorage.setItem(TOKEN_KEY, mockToken);
  }

  signOut(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/sign-in']);
  }
}
