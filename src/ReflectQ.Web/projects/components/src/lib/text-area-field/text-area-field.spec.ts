import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextAreaField } from './text-area-field';

describe('TextAreaField', () => {
  let component: TextAreaField;
  let fixture: ComponentFixture<TextAreaField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextAreaField],
    }).compileComponents();

    fixture = TestBed.createComponent(TextAreaField);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render default placeholder', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('textarea')?.placeholder).toBe('Type your response here...');
  });

  it('should display character count', () => {
    component.value = 'Hello';
    component.maxLength = 500;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.char-count')?.textContent?.trim()).toBe('5 / 500 characters');
  });

  it('should emit valueChange on input', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.valueChange, 'emit');
    const el: HTMLElement = fixture.nativeElement;
    const textarea = el.querySelector('textarea')!;
    textarea.value = 'Test input';
    textarea.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalledWith('Test input');
  });
});
