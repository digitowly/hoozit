import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ScreenSize, ScreenSizeService } from './screen-size.service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ScreenSizeService', () => {
  let service: ScreenSizeService;
  let innerWidth: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    vi.spyOn(window, 'innerWidth', 'get').mockImplementation(() => innerWidth);

    service = TestBed.inject(ScreenSizeService);
  });

  function resizeTo(width: number) {
    innerWidth = width;
  }

  it('should be created and initialize immediately', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize size based on current window width', () => {
    resizeTo(500);
    service.handleResize();
    expect(service.size()).toBe(ScreenSize.SMALL);

    resizeTo(900);
    service.handleResize();
    expect(service.size()).toBe(ScreenSize.MEDIUM);

    resizeTo(1400);
    service.handleResize();
    expect(service.size()).toBe(ScreenSize.LARGE);
  });
});
