import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly httpClient = inject(HttpClient);

  private readonly baseUrl = `${environment.rangoUrl}/user/login/email`;

  readonly errorMessage = signal<string>('');

  readonly isLoginSuccessful = signal(false);

  async loginWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<void> {
    this.errorMessage.set('');

    const res = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      credentials: 'include',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.type === 'opaqueredirect' || res.ok) {
      window.location.href = '/user';
    } else {
      this.isLoginSuccessful.set(false);
      const body = await res.json().catch(() => ({}));
      this.errorMessage.set(body?.message || 'Login failed');
    }
  }

  reset(): void {
    this.errorMessage.set('');
    this.isLoginSuccessful.set(false);
  }
}
