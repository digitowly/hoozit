import { describe, beforeEach, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LoginService } from './login.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoginService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial values', () => {
    expect(service.errorMessage()).toBe('');
    expect(service.isLoginSuccessful()).toBe(false);
  });

  describe('loginWithEmailAndPassword', () => {
    it('should set isLoginSuccessful to true on successful login', () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResponse = { token: 'fake-token' };

      service.loginWithEmailAndPassword(email, password);

      const req = httpMock.expectOne(
        `${environment.rangoUrl}/user/login/email`,
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);

      expect(service.isLoginSuccessful()).toBe(true);
      expect(service.errorMessage()).toBe('');
    });

    it('should set isLoginSuccessful to false and errorMessage on failed login', () => {
      const email = 'test@example.com';
      const password = 'wrong-password';
      const mockError = { message: 'Invalid credentials' };

      service.loginWithEmailAndPassword(email, password);

      const req = httpMock.expectOne(
        `${environment.rangoUrl}/user/login/email`,
      );
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });

      expect(service.isLoginSuccessful()).toBe(false);
      expect(service.errorMessage()).toBe('Invalid credentials');
    });

    it('should clear errorMessage when starting a new login attempt', () => {
      service.errorMessage.set('Previous error');

      service.loginWithEmailAndPassword('email', 'password');

      expect(service.errorMessage()).toBe('');

      const req = httpMock.expectOne(
        `${environment.rangoUrl}/user/login/email`,
      );
      req.flush({});
    });
  });

  describe('reset', () => {
    it('should reset signals to initial values', () => {
      service.errorMessage.set('Some error');
      service.isLoginSuccessful.set(true);

      service.reset();

      expect(service.errorMessage()).toBe('');
      expect(service.isLoginSuccessful()).toBe(false);
    });
  });
});
