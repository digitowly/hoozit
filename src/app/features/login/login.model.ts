import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';

export interface LoginForm {
  email: string;
  password: string;
}

export type LoginFormGroup = ReturnType<typeof form<LoginForm>>;

export const loginModel = signal<LoginForm>({
  email: '',
  password: '',
});
