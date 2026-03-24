import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-app-logo',
  standalone: true,
  imports: [],
  templateUrl: './app-logo.html',
  styleUrl: './app-logo.scss',
})
export class AppLogo {
  @Input() theme: 'light' | 'dark' = 'dark';
  @Input() size: 'sm' | 'lg' = 'sm';
}
