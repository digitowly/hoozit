import { beforeEach, describe, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ScoutLensComponent } from './scout-lens.component';

describe('ScoutLensComponent', () => {
  let component: ScoutLensComponent;
  let fixture: ComponentFixture<ScoutLensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoutLensComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ScoutLensComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('phase', 'scouting');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the lens while scouting', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.scout-lens')).toBeTruthy();
    expect(element.querySelector('.scout-lens-caption')).toBeFalsy();
  });

  it('shows the caption when zoomed out', () => {
    fixture.componentRef.setInput('phase', 'zoomedOut');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.scout-lens')).toBeFalsy();
    expect(element.querySelector('.scout-lens-caption')).toBeTruthy();
  });

  it('shows the retry badge on failure and emits retry on click', () => {
    fixture.componentRef.setInput('activeLens', {
      x: 0,
      y: 0,
      radius: 0,
      loading: false,
      failed: true,
    });
    fixture.detectChanges();

    const retry = vi.fn();
    component.retry.subscribe(retry);

    const badge: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.scout-lens-badge');
    expect(badge).toBeTruthy();

    badge?.click();
    expect(retry).toHaveBeenCalled();
  });

  it('hides the retry badge while a load is in flight', () => {
    fixture.componentRef.setInput('activeLens', {
      x: 0,
      y: 0,
      radius: 0,
      loading: true,
      failed: true,
    });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.scout-lens-badge'),
    ).toBeFalsy();
  });

  it('renders lens size controls near the lens and emits size changes', () => {
    fixture.componentRef.setInput('activeLens', {
      x: 120,
      y: 160,
      radius: 80,
      loading: false,
      failed: false,
    });
    fixture.componentRef.setInput('canDecreaseRadius', true);
    fixture.componentRef.setInput('canIncreaseRadius', false);
    fixture.detectChanges();

    const decrease = vi.fn();
    const increase = vi.fn();
    component.decreaseRadius.subscribe(decrease);
    component.increaseRadius.subscribe(increase);

    const controls: HTMLElement | null =
      fixture.nativeElement.querySelector('.scout-controls');
    const wrapper: HTMLElement | null =
      controls?.querySelector('.button-container') ?? null;
    const buttons = fixture.nativeElement.querySelectorAll(
      '.scout-control',
    ) as NodeListOf<HTMLButtonElement>;

    expect(controls?.style.left).toBe('120px');
    expect(controls?.style.top).toBe('264px');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1].classList).not.toContain('is-visible');
    expect(getComputedStyle(wrapper!).gap).toBe('5px');
    expect(getComputedStyle(buttons[1]).marginLeft).toBe('-2.5px');
    expect(getComputedStyle(buttons[1]).marginRight).toBe('-2.5px');
    expect(getComputedStyle(buttons[1]).borderLeftWidth).toBe('0px');
    expect(buttons[2].disabled).toBe(true);

    buttons[0].click();
    buttons[2].click();

    expect(decrease).toHaveBeenCalledOnce();
    expect(increase).not.toHaveBeenCalled();
  });

  it('positions lens controls below the rendered radius circle', () => {
    fixture.componentRef.setInput('activeLens', {
      x: 120,
      y: 160,
      radius: 140,
      loading: false,
      failed: false,
    });
    fixture.detectChanges();

    const controls: HTMLElement | null =
      fixture.nativeElement.querySelector('.scout-controls');

    expect(controls?.style.top).toBe('324px');
  });

  it('renders search between the lens size buttons when a ghost lens is available', () => {
    fixture.componentRef.setInput('ghostLens', {
      x: 140,
      y: 180,
      radius: 100,
      loading: false,
    });
    fixture.componentRef.setInput('canDecreaseRadius', true);
    fixture.componentRef.setInput('canIncreaseRadius', true);
    fixture.detectChanges();

    const searchHere = vi.fn();
    component.searchHere.subscribe(searchHere);

    const buttons = fixture.nativeElement.querySelectorAll(
      '.scout-control',
    ) as NodeListOf<HTMLButtonElement>;
    const controls: HTMLElement =
      fixture.nativeElement.querySelector('.scout-controls');
    const wrapper: HTMLElement = controls.querySelector('.button-container')!;

    expect(buttons).toHaveLength(3);
    expect(buttons[0].getAttribute('aria-label')).toBe('Decrease lens size');
    expect(buttons[1].getAttribute('aria-label')).toBe('Scout here');
    expect(buttons[2].getAttribute('aria-label')).toBe('Increase lens size');
    expect(buttons[1].classList).toContain('is-visible');
    expect(getComputedStyle(wrapper).gap).toBe('5px');
    expect(getComputedStyle(buttons[1]).marginLeft).toBe('0px');
    expect(getComputedStyle(buttons[1]).marginRight).toBe('0px');
    expect(getComputedStyle(buttons[1]).paddingLeft).toBe('12px');
    expect(getComputedStyle(buttons[1]).paddingRight).toBe('12px');

    buttons[1].click();

    expect(searchHere).toHaveBeenCalledOnce();
  });

  it('does not glide the current radius or controls when the ghost lens appears', () => {
    fixture.componentRef.setInput('phase', 'anchored');
    fixture.componentRef.setInput('activeLens', {
      x: 120,
      y: 160,
      radius: 80,
      loading: false,
      failed: false,
    });
    fixture.detectChanges();

    fixture.componentRef.setInput('phase', 'scouting');
    fixture.componentRef.setInput('ghostLens', {
      x: 140,
      y: 180,
      radius: 100,
      loading: false,
    });
    fixture.detectChanges();

    const activeLens: HTMLElement | null = fixture.nativeElement.querySelector(
      '.scout-lens:not(.scout-lens--ghost)',
    );
    const controls: HTMLElement | null =
      fixture.nativeElement.querySelector('.scout-controls');

    expect(activeLens?.classList).not.toContain('scout-lens--gliding');
    expect(controls?.classList).not.toContain('is-gliding');
  });

  it('hides the search control while the ghost lens is loading', () => {
    fixture.componentRef.setInput('ghostLens', {
      x: 140,
      y: 180,
      radius: 100,
      loading: true,
    });
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll(
      '.scout-control',
    ) as NodeListOf<HTMLButtonElement>;

    expect(buttons).toHaveLength(3);
    expect(buttons[1].getAttribute('aria-label')).toBe('Scout here');
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[1].getAttribute('aria-hidden')).toBe('true');
    expect(buttons[1].classList).not.toContain('is-visible');
    expect(getComputedStyle(buttons[1]).borderLeftWidth).toBe('0px');
  });

  it('hides lens overlays while zooming the map', () => {
    fixture.componentRef.setInput('activeLens', {
      x: 130,
      y: 170,
      radius: 90,
      loading: false,
    });
    fixture.componentRef.setInput('ghostLens', {
      x: 140,
      y: 180,
      radius: 100,
      loading: false,
    });
    fixture.componentRef.setInput('zooming', true);
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.scout-lens')).toBeFalsy();
    expect(element.querySelector('.scout-lens-badge')).toBeFalsy();
    expect(element.querySelector('.scout-controls')).toBeFalsy();
    expect(element.querySelector('.scout-user-indicator')).toBeFalsy();
  });
});
