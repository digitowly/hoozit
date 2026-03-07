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
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
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

  it('should track multiple modals independently', () => {
    service.open('a');
    service.open('b');
    expect(service.isOpen('a')).toBe(true);
    expect(service.isOpen('b')).toBe(true);

    service.close('a');
    expect(service.isOpen('a')).toBe(false);
    expect(service.isOpen('b')).toBe(true);
  });

  it('should close all modals', () => {
    service.open('a');
    service.open('b');
    service.closeAll();
    expect(service.isOpen('a')).toBe(false);
    expect(service.isOpen('b')).toBe(false);
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
});
