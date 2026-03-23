import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QrCodeFrame } from './qr-code-frame';

describe('QrCodeFrame', () => {
  let component: QrCodeFrame;
  let fixture: ComponentFixture<QrCodeFrame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCodeFrame],
    }).compileComponents();

    fixture = TestBed.createComponent(QrCodeFrame);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to 420x420', () => {
    expect(component.width).toBe(420);
    expect(component.height).toBe(420);
  });

  it('should apply custom width and height', () => {
    fixture.componentRef.setInput('width', 300);
    fixture.componentRef.setInput('height', 300);
    fixture.detectChanges();
    const frameEl = fixture.nativeElement.querySelector('.qr-frame') as HTMLElement;
    expect(frameEl.style.width).toBe('300px');
    expect(frameEl.style.height).toBe('300px');
  });

  it('should have the qr-frame container', () => {
    const frameEl = fixture.nativeElement.querySelector('.qr-frame');
    expect(frameEl).toBeTruthy();
  });
});
