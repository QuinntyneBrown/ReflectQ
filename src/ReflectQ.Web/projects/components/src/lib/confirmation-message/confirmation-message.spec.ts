import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationMessage } from './confirmation-message';

describe('ConfirmationMessage', () => {
  let component: ConfirmationMessage;
  let fixture: ComponentFixture<ConfirmationMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationMessage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render default title', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.title')?.textContent?.trim()).toBe('Thank you!');
  });

  it('should render custom title', () => {
    component.title = 'Success!';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.title')?.textContent?.trim()).toBe('Success!');
  });

  it('should render description', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.description')?.textContent).toContain('Your response has been');
  });

  it('should render note', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.note')?.textContent?.trim()).toBe('You can close this page now.');
  });
});
