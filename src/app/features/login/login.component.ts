import { Component, inject } from '@angular/core';
import { IconComponent } from '../../components/icon/icon.component';
import { LoginButtonComponent } from '../../components/login-button/login-button.component';
import { form } from '@angular/forms/signals';
import { loginModel } from './login.model';
import { LoginService } from '../../services/login/login.service';

@Component({
  selector: 'login',
  imports: [IconComponent, LoginButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly loginService = inject(LoginService);

  protected readonly loginForm = form(loginModel);

  protected readonly errorMessage = this.loginService.errorMessage.asReadonly();

  loginWithEmailAndPassword(): void {
    this.loginService.loginWithEmailAndPassword(
      this.loginForm.email().value(),
      this.loginForm.password().value(),
    );
  }
}
