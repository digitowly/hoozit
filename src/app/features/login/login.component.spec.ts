import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LoginComponent } from './login.component';
import { LoginService } from '../../services/login/login.service';
import { By } from '@angular/platform-browser';
import { IconRegistryService } from '../../services/icon-registry/icon-registry.service';
import { provideHttpClient } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let loginServiceMock: {
    errorMessage: ReturnType<typeof signal<string>>;
    loginWithEmailAndPassword: ReturnType<typeof vi.fn>;
  };
  let iconRegistryServiceMock: {
    getIcon: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    loginServiceMock = {
      errorMessage: signal(''),
      loginWithEmailAndPassword: vi.fn(),
    };

    iconRegistryServiceMock = {
      getIcon: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        { provide: LoginService, useValue: loginServiceMock },
        { provide: IconRegistryService, useValue: iconRegistryServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the welcome message', () => {
    const heading = fixture.debugElement.query(
      By.css('[data-test-id="login-title"]'),
    ).nativeElement;
    expect(heading.textContent).toContain('Welcome back');
  });

  it('should have social login buttons', () => {
    const googleButton = fixture.debugElement.query(
      By.css('[data-test-id="social-login-google"]'),
    );
    const appleButton = fixture.debugElement.query(
      By.css('[data-test-id="social-login-apple"]'),
    );

    expect(googleButton).toBeTruthy();
    expect(appleButton).toBeTruthy();
    expect(googleButton.attributes['provider']).toBe('google');
    expect(appleButton.attributes['provider']).toBe('apple');
  });

  it('should display error message when service has an error', () => {
    loginServiceMock.errorMessage.set('Invalid credentials');
    fixture.detectChanges();

    const errorParagraph = fixture.debugElement.query(
      By.css('[data-test-id="error-message"]'),
    );
    expect(errorParagraph).toBeTruthy();
    expect(errorParagraph.nativeElement.textContent).toContain(
      'Invalid credentials',
    );
  });

  it('should not display error message when service has no error', () => {
    loginServiceMock.errorMessage.set('');
    fixture.detectChanges();

    const errorParagraph = fixture.debugElement.query(
      By.css('[data-test-id="error-message"]'),
    );
    expect(errorParagraph).toBeNull();
  });
});
