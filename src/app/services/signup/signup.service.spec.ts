import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { registrationErrorMessage, SignupService } from './signup.service';

function respondWith(status: number, body = '', headers = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response(status === 204 ? null : body, { status, headers })),
  );
}

describe('SignupService', () => {
  let service: SignupService;

  beforeEach(() => {
    service = TestBed.inject(SignupService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the form to Scout with a trimmed email', async () => {
    respondWith(202);

    const result = await service.register(' a@b.co ', 'pw', 'pw', 'captcha');

    expect(result).toEqual({ kind: 'accepted' });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('http://localhost:8080/auth/email/register');
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'a@b.co',
      password: 'pw',
      password_confirm: 'pw',
      turnstile_token: 'captcha',
    });
  });

  it('shows the message Scout rejected the request with', async () => {
    respondWith(400, '{"error":"captcha verification failed"}');

    const result = await service.register('a@b.co', 'pw', 'pw', 'captcha');

    expect(result).toEqual({
      kind: 'rejected',
      message: 'captcha verification failed',
    });
  });

  it('survives a rejection without JSON', async () => {
    respondWith(400, 'Bad Request');

    const result = await service.register('a@b.co', 'pw', 'pw', 'captcha');

    expect(result).toEqual({ kind: 'rejected', message: null });
  });

  it('keeps the wait from a rate limit', async () => {
    respondWith(429, 'Too Many Requests', { 'Retry-After': '360' });

    const result = await service.register('a@b.co', 'pw', 'pw', 'captcha');

    expect(result).toEqual({ kind: 'tooManyAttempts', retryAfterSeconds: 360 });
  });

  it('handles a rate limit without a wait', async () => {
    respondWith(429);

    const result = await service.register('a@b.co', 'pw', 'pw', 'captcha');

    expect(result).toEqual({ kind: 'tooManyAttempts', retryAfterSeconds: null });
  });

  it('treats a server failure as unavailable', async () => {
    respondWith(503);

    const result = await service.register('a@b.co', 'pw', 'pw', 'captcha');

    expect(result).toEqual({ kind: 'unavailable' });
  });

  it('treats a network failure as unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    const result = await service.register('a@b.co', 'pw', 'pw', 'captcha');

    expect(result).toEqual({ kind: 'unavailable' });
  });

  it('posts a resend with a new captcha', async () => {
    respondWith(204);

    const result = await service.resendVerification('a@b.co', 'captcha');

    expect(result).toEqual({ kind: 'accepted' });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe('http://localhost:8080/auth/resend-verification');
    expect(JSON.parse(init?.body as string)).toEqual({
      email: 'a@b.co',
      turnstile_token: 'captcha',
    });
  });
});

describe('registrationErrorMessage', () => {
  it('prefers the message from Scout', () => {
    expect(registrationErrorMessage({ kind: 'rejected', message: 'Nope' })).toBe('Nope');
  });

  it('rounds the wait up to minutes', () => {
    expect(
      registrationErrorMessage({ kind: 'tooManyAttempts', retryAfterSeconds: 61 }),
    ).toContain('2 min');
  });

  it('has a fallback without a wait', () => {
    expect(
      registrationErrorMessage({ kind: 'tooManyAttempts', retryAfterSeconds: null }),
    ).toContain('later');
  });

  it('has a fallback for everything else', () => {
    expect(registrationErrorMessage({ kind: 'unavailable' })).toContain('try again');
  });
});
