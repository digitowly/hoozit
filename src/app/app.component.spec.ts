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

  it('keeps navigation and routed content available without location permission', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(location.getLocation).not.toHaveBeenCalled();
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('navigation')).not.toBeNull();
    location.error.set('denied');
    location.isLoading.set(false);
    fixture.detectChanges();
    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('navigation')).not.toBeNull();
  });
});
