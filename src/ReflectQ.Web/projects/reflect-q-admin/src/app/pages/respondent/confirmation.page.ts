import { Component } from '@angular/core';
import { ConfirmationMessage } from 'components';

@Component({
  selector: 'app-confirmation-page',
  imports: [ConfirmationMessage],
  templateUrl: './confirmation.page.html',
  styleUrl: './confirmation.page.scss',
})
export class ConfirmationPage {}
