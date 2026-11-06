import {
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { ContentContainerComponent } from '../../../components/content-container/content-container.component';
import { IconComponent } from '../../../components/icon/icon.component';
import { FormContainerComponent } from '../../../components/forms/form-container/form-container.component';
import { TurnstileComponent } from '../../../components/turnstile/turnstile.component';
import {
  registrationErrorMessage,
  SignupService,
} from '../../../services/signup/signup.service';
import { isValidEmail } from '../password-rules';

// Matches Scout's EMAIL_MIN_INTERVAL_SECS.
const RESEND_COOLDOWN_SECONDS = 120;

@Component({
  selector: 'check-inbox',
  imports: [
    ContentContainerComponent,
    FormContainerComponent,
    FormField,
    IconComponent,
    RouterLink,
    TurnstileComponent,
  ],
  templateUrl: './check-inbox.component.html',
  styleUrl: '../signup.component.scss',
})
export class CheckInboxComponent implements OnDestroy {
  private readonly signupService = inject(SignupService);
  private readonly turnstile = viewChild<TurnstileComponent>('captcha');
  private countdown?: ReturnType<typeof setInterval>;

  /** Without one, the user came from the login screen and enters the address here. */
  protected readonly registeredEmail = this.signupService.registeredEmail();

  private readonly model = signal({ email: this.registeredEmail ?? '' });
  protected readonly emailForm = form(this.model);

  protected readonly hasSentMail = signal(this.registeredEmail !== null);
  protected readonly secondsLeft = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly turnstileToken = signal<string | null>(null);

  protected readonly isCoolingDown = computed(() => this.secondsLeft() > 0);
  protected readonly countdownLabel = computed(() => {
    const seconds = this.secondsLeft();
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });
  protected readonly canResend = computed(
    () =>
      !this.isLoading() &&
      !this.isCoolingDown() &&
      this.turnstileToken() !== null &&
      isValidEmail(this.model().email),
  );

  constructor() {
    if (this.registeredEmail !== null) this.startCooldown();
  }

  protected onCaptchaFailed(): void {
    this.errorMessage.set(
      $localize`:@@signupCaptchaFailed:We couldn't verify you're human. Please try again.`,
    );
  }

  protected async resend(): Promise<void> {
    const token = this.turnstileToken();
    if (!this.canResend() || !token) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    const result = await this.signupService.resendVerification(
      this.model().email,
      token,
    );
    this.isLoading.set(false);
    this.turnstile()?.reset();

    if (result.kind === 'accepted') {
      this.hasSentMail.set(true);
      this.startCooldown();
    } else {
      this.errorMessage.set(registrationErrorMessage(result));
    }
  }

  private startCooldown(): void {
    this.secondsLeft.set(RESEND_COOLDOWN_SECONDS);
    clearInterval(this.countdown);
    this.countdown = setInterval(() => {
      this.secondsLeft.update((seconds) => seconds - 1);
      if (this.secondsLeft() === 0) clearInterval(this.countdown);
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdown);
    this.signupService.registeredEmail.set(null);
  }
}
