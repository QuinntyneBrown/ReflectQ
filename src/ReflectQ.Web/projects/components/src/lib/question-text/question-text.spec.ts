import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionText } from './question-text';

describe('QuestionText', () => {
  let component: QuestionText;
  let fixture: ComponentFixture<QuestionText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionText],
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionText);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render text input', () => {
    component.text = 'How was your experience?';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent?.trim()).toBe('How was your experience?');
  });
});
