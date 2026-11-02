import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppComponent } from './app.component';
import { UserLocationService } from './services/user/user-location/user-location.service';

describe('App location requirement', () => {
  const location = {
    isValid: signal(false),
    isLoading: signal(true),
    error: signal<string | null>(null),
    getLocation: vi.fn(),
    retry: vi.fn(),
  };

  beforeEach(() => {
    location.isValid.set(false);
    location.isLoading.set(true);
    location.error.set(null);
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: UserLocationService, useValue: location }],
    }).overrideComponent(AppComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
    });
  });

  it('withholds navigation and routed content until a real location is available', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(location.getLocation).toHaveBeenCalledOnce();
    expect(element.querySelector('router-outlet')).toBeNull();
    expect(element.querySelector('navigation')).toBeNull();
    expect(element.textContent).toContain('Finding your location');
    location.isValid.set(true);
    fixture.detectChanges();
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('.location-gate')).toBeNull();
    location.isValid.set(false);
    location.isLoading.set(false);
    location.error.set('denied');
    fixture.detectChanges();
    expect(element.querySelector('router-outlet')).toBeNull();
    expect(element.textContent).toContain('browser settings');
    element.querySelector('button')!.click();
    expect(location.retry).toHaveBeenCalledOnce();
  });
});
