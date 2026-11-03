import { ApplicationRef, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OccurrencesViewComponent } from './occurrences-view.component';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import { UserProfileService } from '../../../services/user/user-data/user-profile.service';
import { CustomRouteReuseStrategy } from '../../../route-reuse-strategy';
import { authInterceptor } from '../../../interceptors/auth.interceptor';
import {
  Occurrence,
  SubmissionStatus,
} from '../../../services/occurrence/occurrence.model';
import { environment } from '../../../../environments/environment';

@Component({ template: '' })
class OtherView {}

describe('Occurrences view navigation', () => {
  const occurrence: Occurrence = {
    id: 'fox-1',
    author: { id: 'scout-1', nickname: 'Scout', image: '', role: 'user' },
    submitted_name: 'Red fox',
    description: 'At the forest edge',
    confidence: 0.9,
    observed_at: '2026-08-19T08:00:00Z',
    status: SubmissionStatus.DRAFT,
    is_visible: false,
    kingdom: 'Animalia',
    detection_method: 'visual',
    evidence_type: 'photo',
    coordinates: { latitude: 52.52, longitude: 13.405 },
  };
  const url = `${environment.scoutUrl}/user/occurrences`;
  const refreshUrl = `${environment.scoutUrl}/auth/refresh/web`;
  let http: HttpTestingController;
  let harness: RouterTestingHarness;
  let service: UserOccurrencesService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'other', component: OtherView, data: { reuse: true } },
          { path: 'user/occurrences', component: OccurrencesViewComponent },
        ]),
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
        {
          provide: UserProfileService,
          useValue: { profileResource: { status: signal('idle') } },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create('/other');
    service = TestBed.inject(UserOccurrencesService);
    TestBed.tick();
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  async function settle() {
    await TestBed.inject(ApplicationRef).whenStable();
    harness.detectChanges();
  }

  it('requests fresh occurrences on entry and on return after an earlier empty response', async () => {
    http.expectOne(url).flush([]);
    await settle();

    await harness.navigateByUrl('/user/occurrences');
    TestBed.tick();
    const request = http.expectOne(url);
    expect(request.request.withCredentials).toBe(true);
    request.flush([occurrence]);
    await settle();

    expect(harness.routeNativeElement?.textContent).toContain('Red fox');
    await harness.navigateByUrl('/other');
    await harness.navigateByUrl('/user/occurrences');
    TestBed.tick();
    http.expectOne(url).flush([]);
    await settle();
    expect(service.resource.status()).toBe('resolved');
  });

  it('uses the in-flight initial request when entering the list', async () => {
    const pending = http.expectOne(url);
    await harness.navigateByUrl('/user/occurrences');
    TestBed.tick();
    http.expectNone(url);
    expect(harness.routeNativeElement?.textContent).toContain(
      'Loading sightings',
    );
    pending.flush([occurrence]);
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Red fox');
  });

  it('recovers on entry after an earlier authentication refresh failed', async () => {
    http
      .expectOne(url)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    http
      .expectOne(refreshUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    await settle();
    expect(service.resource.status()).toBe('error');

    await harness.navigateByUrl('/user/occurrences');
    TestBed.tick();
    http
      .expectOne(url)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    http.expectOne(refreshUrl).flush({});
    http.expectOne(url).flush([]);
    await settle();
    expect(service.resource.status()).toBe('resolved');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Your first discovery awaits',
    );
  });

  it('shows a retry action instead of an empty list after a failed request', async () => {
    http.expectOne(url).flush([]);
    await settle();
    await harness.navigateByUrl('/user/occurrences');
    TestBed.tick();
    vi.useFakeTimers();
    http.expectOne(url).flush(null, { status: 503, statusText: 'Unavailable' });
    for (const delay of [500, 1000]) {
      vi.advanceTimersByTime(delay);
      http
        .expectOne(url)
        .flush(null, { status: 503, statusText: 'Unavailable' });
    }
    vi.useRealTimers();
    await settle();

    expect(harness.routeNativeElement?.textContent).toContain(
      "Couldn't load your sightings",
    );
    expect(harness.routeNativeElement?.textContent).not.toContain(
      'Your first discovery awaits',
    );
    harness.routeNativeElement
      ?.querySelector<HTMLButtonElement>('[role="alert"] button')
      ?.click();
    TestBed.tick();
    http.expectOne(url).flush([]);
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain(
      'Your first discovery awaits',
    );
  });
  it('recovers the initial sightings request without leaving the page', async () => {
    const initial = http.expectOne(url);
    await harness.navigateByUrl('/user/occurrences');
    TestBed.tick();
    vi.useFakeTimers();
    initial.flush(null, { status: 503, statusText: 'Unavailable' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(
      'Loading sightings',
    );
    expect(
      harness.routeNativeElement?.querySelector('[role="alert"]'),
    ).toBeNull();
    vi.advanceTimersByTime(500);
    http.expectOne(url).flush([occurrence]);
    vi.useRealTimers();
    await settle();
    expect(harness.routeNativeElement?.textContent).toContain('Red fox');
  });
});
