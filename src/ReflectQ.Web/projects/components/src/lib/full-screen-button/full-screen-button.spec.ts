import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullScreenButton } from './full-screen-button';

describe('FullScreenButton', () => {
  let component: FullScreenButton;
  let fixture: ComponentFixture<FullScreenButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullScreenButton],
    }).compileComponents();

    fixture = TestBed.createComponent(FullScreenButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit toggle event on click', () => {
    const spy = vi.fn();
    component.toggle.subscribe(spy);

    const button = fixture.nativeElement.querySelector('button');
    button.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should display Full Screen text', () => {
    const span = fixture.nativeElement.querySelector('.fullscreen-btn span');
    expect(span.textContent.trim()).toBe('Full Screen');
  });

  it('should contain an SVG icon', () => {
    const svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
