import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, output } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { SignupComponent } from './signup.component';
import { SignupService } from '../../services/signup/signup.service';
import { TurnstileComponent } from '../../components/turnstile/turnstile.component';

@Component({ selector: 'app-turnstile', template: '' })
class FakeTurnstileComponent {
  readonly tokenChange = output<string | null>();
  readonly failed = output<void>();
  readonly reset = vi.fn();
}

describe('SignupComponent', () => {
  let fixture: ComponentFixture<SignupComponent>;
  let element: HTMLElement;
  const register = vi.fn();

  const byId = <T extends HTMLElement>(id: string) =>
    element.querySelector<T>(`[data-test-id="${id}"]`);

  function type(id: string, value: string): void {
    const input = byId<HTMLInputElement>(id)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
  }

  function fillIn(password = 'Secret1!', confirm = password): void {
    type('signup-email', 'a@b.co');
    type('signup-password', password);
    type('signup-password-confirm', confirm);
    fixture.detectChanges();
  }

  const captcha = () =>
    fixture.debugElement.query((node) => node.name === 'app-turnstile')
      .componentInstance as FakeTurnstileComponent;

  function solveCaptcha(): void {
    captcha().tokenChange.emit('token');
    fixture.detectChanges();
  }

  const submitButton = () => byId<HTMLButtonElement>('signup-submit')!;

  beforeEach(async () => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideRouter([]),
        { provide: SignupService, useValue: { register, registeredEmail: { set: vi.fn() } } },
      ],
    });
    TestBed.overrideComponent(SignupComponent, {
      remove: { imports: [TurnstileComponent] },
      add: { imports: [FakeTurnstileComponent] },
    });
    fixture = TestBed.createComponent(SignupComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('keeps submit disabled until the form is valid and the captcha is solved', () => {
    expect(submitButton().disabled).toBe(true);

    fillIn();
    expect(submitButton().disabled).toBe(true);

    solveCaptcha();
    expect(submitButton().disabled).toBe(false);
  });

  it('shows an error for an invalid email once the field was left', () => {
    type('signup-email', 'not-an-email');
    fixture.detectChanges();

    expect(byId('signup-email-error')).toBeTruthy();
  });

  it('shows an error when the passwords differ', () => {
    fillIn('Secret1!', 'Secret2!');
    solveCaptcha();

    expect(byId('signup-mismatch-error')).toBeTruthy();
    expect(submitButton().disabled).toBe(true);
  });

  it('ticks off password rules while typing', () => {
    type('signup-password', 'A');
    fixture.detectChanges();

    const met = element.querySelectorAll('.password-rules li.met');
    expect(met.length).toBe(1);
    expect(met[0].textContent).toContain('uppercase');
  });

  it('warns about a too long password', () => {
    type('signup-password', 'Aa1!' + 'a'.repeat(69));
    fixture.detectChanges();

    expect(byId('signup-too-long')).toBeTruthy();
  });

  it('toggles password visibility', () => {
    byId('signup-toggle-password')!.click();
    fixture.detectChanges();

    expect(byId<HTMLInputElement>('signup-password')!.type).toBe('text');
  });

  it('goes to the inbox page after a successful signup', async () => {
    register.mockResolvedValue({ kind: 'accepted' });
    const navigate = vi
      .spyOn(TestBed.inject(Router), 'navigateByUrl')
      .mockResolvedValue(true);
    fillIn();
    solveCaptcha();

    submitButton().click();
    await fixture.whenStable();

    expect(register).toHaveBeenCalledWith('a@b.co', 'Secret1!', 'Secret1!', 'token');
    expect(navigate).toHaveBeenCalledWith('/signup/check-inbox');
  });

  it('keeps the form and loads a new captcha after an error', async () => {
    register.mockResolvedValue({ kind: 'rejected', message: 'Nope' });
    fillIn();
    solveCaptcha();

    submitButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(byId('error-message')?.textContent).toContain('Nope');
    expect(captcha().reset).toHaveBeenCalled();
    expect(byId<HTMLInputElement>('signup-email')!.value).toBe('a@b.co');
  });

  it('shows a message when the captcha fails', () => {
    captcha().failed.emit();
    fixture.detectChanges();

    expect(byId('error-message')).toBeTruthy();
  });
});
