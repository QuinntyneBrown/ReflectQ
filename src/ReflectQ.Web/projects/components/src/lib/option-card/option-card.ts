import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-option-card',
  standalone: true,
  imports: [],
  templateUrl: './option-card.html',
  styleUrl: './option-card.scss',
})
export class OptionCard {
  @Input() text = '';
  @Input() selected = false;
  @Output() selectedChange = new EventEmitter<void>();
}
