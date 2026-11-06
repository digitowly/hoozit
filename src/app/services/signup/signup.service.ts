import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export type RegistrationResult =
  | { kind: 'accepted' }
  | { kind: 'rejected'; message: string | null }
  | { kind: 'tooManyAttempts'; retryAfterSeconds: number | null }
  | { kind: 'unavailable' };

export function registrationErrorMessage(result: RegistrationResult): string {
  const unavailable = $localize`:@@signupUnavailable:Something went wrong. Please check your connection and try again.`;
  switch (result.kind) {
    case 'rejected':
      return result.message ?? unavailable;
    case 'tooManyAttempts':
      if (result.retryAfterSeconds === null) {
        return $localize`:@@signupTooManyAttempts:Too many attempts. Please try again later.`;
      }
      return $localize`:@@signupTooManyAttemptsWait:Too many attempts. Please try again in ${Math.ceil(result.retryAfterSeconds / 60)}:minutes: min.`;
    default:
      return unavailable;
  }
}

@Injectable({ providedIn: 'root' })
export class SignupService {
  /** Set after a signup, so the inbox page knows it doesn't have to ask for the address. */
  readonly registeredEmail = signal<string | null>(null);

  register(
    email: string,
    password: string,
    passwordConfirm: string,
    turnstileToken: string,
  ): Promise<RegistrationResult> {
    return this.post('/auth/email/register', {
      email: email.trim(),
      password,
      password_confirm: passwordConfirm,
      turnstile_token: turnstileToken,
    });
  }

  resendVerification(
    email: string,
    turnstileToken: string,
  ): Promise<RegistrationResult> {
    return this.post('/auth/resend-verification', {
      email: email.trim(),
      turnstile_token: turnstileToken,
    });
  }

  private async post(
    path: string,
    body: Record<string, string>,
  ): Promise<RegistrationResult> {
    try {
      const response = await fetch(`${environment.scoutUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await this.toResult(response);
    } catch {
      return { kind: 'unavailable' };
    }
  }

  private async toResult(response: Response): Promise<RegistrationResult> {
    if (response.ok) return { kind: 'accepted' };
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      return {
        kind: 'tooManyAttempts',
        retryAfterSeconds: retryAfter > 0 ? retryAfter : null,
      };
    }
    if (response.status === 400) {
      const body = await response.json().catch(() => null);
      return { kind: 'rejected', message: body?.error ?? null };
    }
    return { kind: 'unavailable' };
  }
}
