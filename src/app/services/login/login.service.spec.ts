import { describe, beforeEach, it, expect, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LoginService } from './login.service';

describe('LoginService', () => {
  let service: LoginService;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      configurable: true,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [LoginService],
    });
    service = TestBed.inject(LoginService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial values', () => {
    expect(service.errorMessage()).toBe('');
    expect(service.isLoginSuccessful()).toBe(false);
  });

  describe('loginWithEmailAndPassword', () => {
    it('should redirect to /user on successful login', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true, type: 'default', json: async () => ({}) }),
      );

      await service.loginWithEmailAndPassword('test@example.com', 'password123');

      expect(window.location.href).toBe('/user');
      expect(service.errorMessage()).toBe('');
    });

    it('should set errorMessage on failed login', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          type: 'default',
          json: async () => ({ message: 'Invalid credentials' }),
        }),
      );

      await service.loginWithEmailAndPassword('test@example.com', 'wrong-password');

      expect(service.isLoginSuccessful()).toBe(false);
      expect(service.errorMessage()).toBe('Invalid credentials');
    });

    it('should clear errorMessage when starting a new login attempt', async () => {
      service.errorMessage.set('Previous error');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: false, type: 'default', json: async () => ({}) }),
      );

      const loginPromise = service.loginWithEmailAndPassword('email', 'password');
      expect(service.errorMessage()).toBe('');
      await loginPromise;
    });
  });

  describe('reset', () => {
    it('should reset signals to initial values', () => {
      service.errorMessage.set('Some error');
      service.isLoginSuccessful.set(true);

      service.reset();

      expect(service.errorMessage()).toBe('');
      expect(service.isLoginSuccessful()).toBe(false);
    });
  });
});
