import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppLogo } from 'components';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sign-in-page',
  imports: [AppLogo],
  templateUrl: './sign-in.page.html',
  styleUrl: './sign-in.page.scss',
})
export class SignInPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  onSignIn(): void {
    this.authService.signIn();
    this.router.navigate(['/dashboard']);
  }
}
