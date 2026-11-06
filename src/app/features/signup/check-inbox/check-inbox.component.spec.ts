import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, output, signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { CheckInboxComponent } from './check-inbox.component';
import { SignupService } from '../../../services/signup/signup.service';
import { TurnstileComponent } from '../../../components/turnstile/turnstile.component';

@Component({ selector: 'app-turnstile', template: '' })
class FakeTurnstileComponent {
  readonly tokenChange = output<string | null>();
  readonly failed = output<void>();
  readonly reset = vi.fn();
}

describe('CheckInboxComponent', () => {
  let fixture: ComponentFixture<CheckInboxComponent>;
  let element: HTMLElement;
  const resendVerification = vi.fn();
  const registeredEmail = signal<string | null>(null);

  const byId = <T extends HTMLElement>(id: string) =>
    element.querySelector<T>(`[data-test-id="${id}"]`);
  const resendButton = () => byId<HTMLButtonElement>('inbox-resend')!;
  const captcha = () =>
    fixture.debugElement.query((node) => node.name === 'app-turnstile')
      ?.componentInstance as FakeTurnstileComponent | undefined;

  function render(email: string | null): void {
    registeredEmail.set(email);
    fixture = TestBed.createComponent(CheckInboxComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  }

  function solveCaptcha(): void {
    captcha()!.tokenChange.emit('token');
    fixture.detectChanges();
  }

  function typeEmail(value: string): void {
    const input = byId<HTMLInputElement>('inbox-email')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [CheckInboxComponent],
      providers: [
        provideRouter([]),
        { provide: SignupService, useValue: { resendVerification, registeredEmail } },
      ],
    });
    TestBed.overrideComponent(CheckInboxComponent, {
      remove: { imports: [TurnstileComponent] },
      add: { imports: [FakeTurnstileComponent] },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with the 2-minute countdown after a signup', () => {
    render('a@b.co');

    expect(byId('inbox-title')?.textContent).toContain('Check your inbox');
    expect(resendButton().textContent).toContain('2:00');
    expect(resendButton().disabled).toBe(true);
    expect(byId('inbox-email')).toBeNull();
  });

  it('unlocks resend after the countdown', () => {
    render('a@b.co');

    vi.advanceTimersByTime(120_000);
    fixture.detectChanges();
    solveCaptcha();

    expect(resendButton().disabled).toBe(false);
  });

  it('asks for the address when opened from the login screen', () => {
    render(null);

    expect(byId('inbox-title')?.textContent).toContain('Resend');
    expect(byId('inbox-email')).toBeTruthy();
  });

  it('sends the mail and restarts the countdown', async () => {
    resendVerification.mockResolvedValue({ kind: 'accepted' });
    render(null);
    typeEmail('a@b.co');
    solveCaptcha();

    resendButton().click();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(resendVerification).toHaveBeenCalledWith('a@b.co', 'token');
    expect(byId('inbox-title')?.textContent).toContain('Check your inbox');
    expect(resendButton().textContent).toContain('2:00');
  });

  it('shows an error and loads a new captcha when resending fails', async () => {
    resendVerification.mockResolvedValue({ kind: 'unavailable' });
    render(null);
    typeEmail('a@b.co');
    solveCaptcha();

    resendButton().click();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();

    expect(byId('error-message')).toBeTruthy();
    expect(captcha()!.reset).toHaveBeenCalled();
  });

  it('forgets the address when leaving', () => {
    render('a@b.co');

    fixture.destroy();

    expect(registeredEmail()).toBeNull();
  });
});
