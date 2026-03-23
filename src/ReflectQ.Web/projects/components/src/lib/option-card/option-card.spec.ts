import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionCard } from './option-card';

describe('OptionCard', () => {
  let component: OptionCard;
  let fixture: ComponentFixture<OptionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionCard],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render text input', () => {
    component.text = 'Option A';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.text')?.textContent?.trim()).toBe('Option A');
  });

  it('should apply selected class when selected is true', () => {
    component.selected = true;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.option-card')?.classList.contains('selected')).toBe(true);
  });

  it('should not apply selected class when selected is false', () => {
    component.selected = false;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.option-card')?.classList.contains('selected')).toBe(false);
  });

  it('should emit selectedChange on click', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.selectedChange, 'emit');
    const el: HTMLElement = fixture.nativeElement;
    el.querySelector('button')?.click();
    expect(spy).toHaveBeenCalled();
  });
});
