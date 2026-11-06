import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ContentContainerComponent } from '../../components/content-container/content-container.component';
import { IconComponent } from '../../components/icon/icon.component';
import { FormContainerComponent } from '../../components/forms/form-container/form-container.component';
import { TurnstileComponent } from '../../components/turnstile/turnstile.component';
import {
  registrationErrorMessage,
  SignupService,
} from '../../services/signup/signup.service';
import { checkPassword, isPasswordValid, isValidEmail } from './password-rules';

const EMPTY_FORM = { email: '', password: '', passwordConfirm: '' };

@Component({
  selector: 'signup',
  imports: [
    ContentContainerComponent,
    FormContainerComponent,
    FormField,
    IconComponent,
    RouterLink,
    TurnstileComponent,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly signupService = inject(SignupService);
  private readonly router = inject(Router);
  private readonly turnstile = viewChild<TurnstileComponent>('captcha');

  // Lives in the component, so passwords disappear with it.
  private readonly model = signal(EMPTY_FORM);
  protected readonly signupForm = form(this.model);

  protected readonly isPasswordVisible = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly turnstileToken = signal<string | null>(null);

  protected readonly checks = computed(() =>
    checkPassword(this.model().password),
  );
  protected readonly showsEmailError = computed(
    () =>
      this.signupForm.email().touched() && !isValidEmail(this.model().email),
  );
  protected readonly showsMismatchError = computed(() => {
    const { password, passwordConfirm } = this.model();
    return passwordConfirm !== '' && password !== passwordConfirm;
  });
  protected readonly canSubmit = computed(() => {
    const { email, password, passwordConfirm } = this.model();
    return (
      !this.isLoading() &&
      this.turnstileToken() !== null &&
      isValidEmail(email) &&
      isPasswordValid(this.checks()) &&
      password === passwordConfirm
    );
  });

  protected onCaptchaFailed(): void {
    this.errorMessage.set(
      $localize`:@@signupCaptchaFailed:We couldn't verify you're human. Please try again.`,
    );
  }

  protected async submit(): Promise<void> {
    const token = this.turnstileToken();
    if (!this.canSubmit() || !token) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    const { email, password, passwordConfirm } = this.model();
    const result = await this.signupService.register(
      email,
      password,
      passwordConfirm,
      token,
    );
    this.isLoading.set(false);

    if (result.kind === 'accepted') {
      this.model.set(EMPTY_FORM);
      this.signupService.registeredEmail.set(email.trim());
      await this.router.navigateByUrl('/signup/check-inbox');
      return;
    }
    this.errorMessage.set(registrationErrorMessage(result));
    this.turnstile()?.reset();
  }
}
