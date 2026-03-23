import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResponseCounter } from './response-counter';

describe('ResponseCounter', () => {
  let component: ResponseCounter;
  let fixture: ComponentFixture<ResponseCounter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponseCounter],
    }).compileComponents();

    fixture = TestBed.createComponent(ResponseCounter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default count to 0', () => {
    expect(component.count).toBe(0);
  });

  it('should render the count value', () => {
    fixture.componentRef.setInput('count', 42);
    fixture.detectChanges();
    const countEl = fixture.nativeElement.querySelector('.count');
    expect(countEl.textContent.trim()).toBe('42');
  });

  it('should display responses label', () => {
    const labelEl = fixture.nativeElement.querySelector('.responses-label');
    expect(labelEl.textContent.trim()).toBe('responses');
  });

  it('should display live indicator', () => {
    const dotEl = fixture.nativeElement.querySelector('.live-dot');
    const textEl = fixture.nativeElement.querySelector('.live-text');
    expect(dotEl).toBeTruthy();
    expect(textEl.textContent.trim()).toBe('Live');
  });
});
