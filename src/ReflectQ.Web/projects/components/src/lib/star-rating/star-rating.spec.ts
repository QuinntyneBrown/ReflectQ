import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StarRating } from './star-rating';

describe('StarRating', () => {
  let component: StarRating;
  let fixture: ComponentFixture<StarRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StarRating],
    }).compileComponents();

    fixture = TestBed.createComponent(StarRating);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render 5 stars', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const stars = el.querySelectorAll('.star');
    expect(stars.length).toBe(5);
  });

  it('should fill stars based on value', () => {
    component.value = 3;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const filled = el.querySelectorAll('.star.filled');
    expect(filled.length).toBe(3);
  });

  it('should display value label', () => {
    component.value = 4;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.label')?.textContent?.trim()).toBe('4 out of 5');
  });

  it('should emit ratingChange on star click', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.ratingChange, 'emit');
    const el: HTMLElement = fixture.nativeElement;
    const stars = el.querySelectorAll('.star');
    (stars[2] as HTMLElement).dispatchEvent(new Event('click'));
    expect(spy).toHaveBeenCalledWith(3);
  });
});
