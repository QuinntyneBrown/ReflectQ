import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-response-counter',
  standalone: true,
  imports: [],
  templateUrl: './response-counter.html',
  styleUrl: './response-counter.scss',
})
export class ResponseCounter {
  @Input() count = 0;
}
