import {
  inputBinding,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { BannerComponent } from './banner.component';

describe('BannerComponent', () => {
  let fixture: ComponentFixture<BannerComponent>;
  const message = signal('Global info message');
  const variant = signal<'info' | 'warning'>('info');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BannerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(BannerComponent, {
      bindings: [
        inputBinding('message', message),
        inputBinding('variant', variant),
      ],
    });
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders message when provided', () => {
    const text = fixture.debugElement.query(By.css('.banner-text'));
    expect(text).toBeTruthy();
    expect(text.nativeElement.textContent.trim()).toBe('Global info message');
  });

  it('applies warning class for warning variant', async () => {
    message.set('Global warning');
    variant.set('warning');
    fixture.detectChanges();
    await fixture.whenStable();

    const banner = fixture.debugElement.query(By.css('.banner'));
    expect(banner.nativeElement.classList.contains('banner-warning')).toBe(true);
  });
});
