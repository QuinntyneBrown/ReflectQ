import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubmitButton } from './submit-button';

describe('SubmitButton', () => {
  let component: SubmitButton;
  let fixture: ComponentFixture<SubmitButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitButton],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmitButton);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render default label', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('button')?.textContent?.trim()).toBe('Submit');
  });

  it('should render custom label', () => {
    component.label = 'Send';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('button')?.textContent?.trim()).toBe('Send');
  });

  it('should apply disabled class when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('button')?.classList.contains('is-disabled')).toBe(true);
    expect(el.querySelector('button')?.disabled).toBe(true);
  });

  it('should emit submitClick when clicked and not disabled', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.submitClick, 'emit');
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector('button')?.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit submitClick when clicked and disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    const spy = vi.spyOn(component.submitClick, 'emit');
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector('button')?.click();
    expect(spy).not.toHaveBeenCalled();
  });
});
