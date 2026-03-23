import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/sign-in/sign-in.page').then((m) => m.SignInPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./pages/questions/question-list.page').then((m) => m.QuestionListPage),
      },
      {
        path: 'questions/new',
        loadComponent: () =>
          import('./pages/questions/question-form.page').then((m) => m.QuestionFormPage),
      },
      {
        path: 'questions/:id/edit',
        loadComponent: () =>
          import('./pages/questions/question-form.page').then((m) => m.QuestionFormPage),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/user-list.page').then((m) => m.UserListPage),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'present/:id',
    loadComponent: () =>
      import('./pages/presenter/presenter.page').then((m) => m.PresenterPage),
  },
  {
    path: 'respond/:id',
    loadComponent: () =>
      import('./pages/respondent/respondent.page').then((m) => m.RespondentPage),
  },
  {
    path: 'respond/:id/confirmation',
    loadComponent: () =>
      import('./pages/respondent/confirmation.page').then((m) => m.ConfirmationPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
