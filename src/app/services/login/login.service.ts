import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly httpClient = inject(HttpClient);

  private readonly baseUrl = `${environment.rangoUrl}/user/login/email`;

  readonly errorMessage = signal<string>('');

  readonly isLoginSuccessful = signal(false);

  loginWithEmailAndPassword(email: string, password: string): void {
    this.errorMessage.set('');
    this.httpClient.post(this.baseUrl, { email, password }).subscribe({
      next: (response) => {
        this.isLoginSuccessful.set(true);
        console.log('Login successful', response);
      },
      error: (error) => {
        this.isLoginSuccessful.set(false);
        console.error('Login failed', error);
        this.errorMessage.set(error.error?.message || error.message);
      },
    });
  }

  reset(): void {
    this.errorMessage.set('');
    this.isLoginSuccessful.set(false);
  }
}
