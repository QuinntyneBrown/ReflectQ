import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-confirmation-message',
  standalone: true,
  imports: [],
  templateUrl: './confirmation-message.html',
  styleUrl: './confirmation-message.scss',
})
export class ConfirmationMessage {
  @Input() title = 'Thank you!';
  @Input() description = 'Your response has been\nrecorded successfully.';
  @Input() note = 'You can close this page now.';
}
