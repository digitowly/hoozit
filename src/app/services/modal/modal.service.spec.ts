import { describe, beforeEach, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });

    service = TestBed.inject(ModalService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for unknown id', () => {
    expect(service.isOpen('unknown')).toBe(false);
  });

  it('should open a modal by id', () => {
    service.open('a');
    expect(service.isOpen('a')).toBe(true);
  });

  it('should close a modal by id', () => {
    service.open('a');
    service.close('a');
    expect(service.isOpen('a')).toBe(false);
  });

  it.each([
    ['compact', 'compact'],
    ['compact', 'large'],
    ['large', 'compact'],
    ['large', 'large'],
  ] as const)(
    'replaces a %s modal with a %s modal',
    (previousType, nextType) => {
      service.open('a', previousType);
      TestBed.tick();
      service.open('b', nextType);
      TestBed.tick();

      expect(service.isOpen('a')).toBe(false);
      expect(service.isOpen('b')).toBe(true);
      expect(service.hasOpenModal()).toBe(true);
      expect(document.body.style.overflow).toBe(
        nextType === 'large' ? 'hidden' : '',
      );
    },
  );

  it('ignores a delayed close for a replaced modal', () => {
    service.open('a');
    service.open('b');
    service.close('a');

    expect(service.isOpen('b')).toBe(true);
    expect(service.hasOpenModal()).toBe(true);
  });

  it('should close all modals', () => {
    service.open('a');
    service.open('b');
    service.closeAll();
    expect(service.isOpen('a')).toBe(false);
    expect(service.isOpen('b')).toBe(false);
    expect(service.hasOpenModal()).toBe(false);
  });

  it('should close all modals on NavigationStart', async () => {
    service.open('a');
    service.open('b');

    await router.navigate(['/']);

    expect(service.isOpen('a')).toBe(false);
    expect(service.isOpen('b')).toBe(false);
  });

  it('should not throw when closing an already-closed modal', () => {
    expect(() => service.close('never-opened')).not.toThrow();
  });

  it('should handle opening the same modal twice', () => {
    service.open('a');
    service.open('a');
    expect(service.isOpen('a')).toBe(true);
    service.close('a');
    expect(service.isOpen('a')).toBe(false);
  });

  it('should set body overflow hidden when a large modal is open', () => {
    service.open('a', 'large');
    TestBed.tick();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body overflow when the large modal is closed', () => {
    service.open('a', 'large');
    TestBed.tick();
    service.close('a');
    TestBed.tick();
    expect(document.body.style.overflow).toBe('');
  });

  it('should not set body overflow hidden for compact modals', () => {
    service.open('a', 'compact');
    TestBed.tick();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('keeps the active large modal scroll lock when closing its predecessor', () => {
    service.open('a', 'large');
    service.open('b', 'large');
    TestBed.tick();
    service.close('a');
    TestBed.tick();
    expect(document.body.style.overflow).toBe('hidden');

    service.close('b');
    TestBed.tick();
    expect(document.body.style.overflow).toBe('');
  });
});
