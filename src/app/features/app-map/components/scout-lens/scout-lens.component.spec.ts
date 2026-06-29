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
});
