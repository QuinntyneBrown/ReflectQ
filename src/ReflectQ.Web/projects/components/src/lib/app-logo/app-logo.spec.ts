import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppLogo } from './app-logo';

describe('AppLogo', () => {
  let component: AppLogo;
  let fixture: ComponentFixture<AppLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppLogo],
    }).compileComponents();

    fixture = TestBed.createComponent(AppLogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to dark theme and sm size', () => {
    expect(component.theme).toBe('dark');
    expect(component.size).toBe('sm');
  });

  it('should apply light theme class to text', () => {
    fixture.componentRef.setInput('theme', 'light');
    fixture.detectChanges();
    const textEl = fixture.nativeElement.querySelector('.logo-text');
    expect(textEl.classList.contains('light')).toBe(true);
  });

  it('should apply lg size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const logoEl = fixture.nativeElement.querySelector('.logo');
    expect(logoEl.classList.contains('lg')).toBe(true);
  });

  it('should render Q in the logo box', () => {
    const boxEl = fixture.nativeElement.querySelector('.logo-box');
    expect(boxEl.textContent.trim()).toBe('Q');
  });

  it('should render ReflectQ text', () => {
    const textEl = fixture.nativeElement.querySelector('.logo-text');
    expect(textEl.textContent.trim()).toBe('ReflectQ');
  });
});
