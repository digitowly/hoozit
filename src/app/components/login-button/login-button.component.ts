import { Component, computed, input, output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../../services/icon-registry/icon-registry.model';
import { NgTemplateOutlet } from '@angular/common';

export type LoginProvider = 'google' | 'apple' | 'email';

const PROVIDER_CONFIG: Record<
  LoginProvider,
  { icon: IconName; label: string; isLink?: boolean }
> = {
  google: { icon: 'google', label: 'Login with Google', isLink: true },
  apple: { icon: 'apple', label: 'Login with Apple', isLink: true },
  email: { icon: 'mail', label: 'Login with Email', isLink: false },
};

@Component({
  selector: 'login-button',
  imports: [IconComponent, NgTemplateOutlet],
  templateUrl: './login-button.component.html',
  styleUrl: './login-button.component.scss',
})
export class LoginButtonComponent {
  readonly provider = input.required<LoginProvider>();

  readonly config = computed(() => PROVIDER_CONFIG[this.provider()]);
  readonly href = computed(
    () => `${environment.scoutUrl}/auth/${this.provider()}`,
  );

  click = output<void>();

  onClick() {
    this.click.emit();
  }
}
