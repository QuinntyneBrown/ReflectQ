import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-star-rating',
  standalone: true,
  imports: [],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRating {
  @Input() value = 0;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [0, 1, 2, 3, 4];
}
