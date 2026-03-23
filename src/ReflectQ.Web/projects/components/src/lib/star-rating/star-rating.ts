import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-star-rating',
  standalone: true,
  imports: [],
  template: `
    <div class="star-rating">
      <div class="stars">
        @for (star of stars; track star) {
          <svg
            class="star"
            [class.filled]="star < value"
            (click)="ratingChange.emit(star + 1)"
            width="44"
            height="44"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
            />
          </svg>
        }
      </div>
      <span class="label">{{ value }} out of 5</span>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .star-rating {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stars {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .star {
      cursor: pointer;
      fill: #B0B0B0;
    }

    .star.filled {
      fill: #16160C;
    }

    .label {
      margin-top: 12px;
      font-family: 'Inconsolata', monospace;
      font-size: 18px;
      font-weight: 500;
      color: #7A7A7A;
      text-align: center;
    }
  `,
})
export class StarRating {
  @Input() value = 0;
  @Output() ratingChange = new EventEmitter<number>();

  stars = [0, 1, 2, 3, 4];
}
