import { Component, computed, input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../../services/icon-registry/icon-registry.model';

export type LoginProvider = 'google' | 'apple';

const PROVIDER_CONFIG: Record<LoginProvider, { icon: IconName; label: string }> = {
  google: { icon: 'google', label: 'Login with Google' },
  apple: { icon: 'apple', label: 'Login with Apple' },
};

@Component({
  selector: 'login-button',
  imports: [IconComponent],
  templateUrl: './login-button.component.html',
  styleUrl: './login-button.component.scss',
})
export class LoginButtonComponent {
  readonly provider = input.required<LoginProvider>();

  readonly config = computed(() => PROVIDER_CONFIG[this.provider()]);
  readonly href = computed(() => `${environment.rangoUrl}/user/login/${this.provider()}`);
}
