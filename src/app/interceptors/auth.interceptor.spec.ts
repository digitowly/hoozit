import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { SESSION_REFRESH_URL } from '../services/session-refresh/session-refresh.service';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  const profileUrl = `${environment.scoutUrl}/users/me/profile`;
  const occurrencesUrl = `${environment.scoutUrl}/user/occurrences`;
  let http: HttpClient;
  let requests: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    requests.verify();
    vi.useRealTimers();
  });

  it('shares one refresh between concurrent unauthorized requests and retries both', () => {
    const profile = vi.fn();
    const occurrences = vi.fn();
    http.get(profileUrl, { withCredentials: true }).subscribe(profile);
    http.get(occurrencesUrl, { withCredentials: true }).subscribe(occurrences);
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests
      .expectOne(occurrencesUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });

    const refresh = requests.expectOne(SESSION_REFRESH_URL);
    expect(refresh.request.withCredentials).toBe(true);
    refresh.flush({});
    const retriedProfile = requests.expectOne(profileUrl);
    expect(retriedProfile.request.withCredentials).toBe(true);
    retriedProfile.flush({ nickname: 'Scout' });
    requests.expectOne(occurrencesUrl).flush([]);
    expect(profile).toHaveBeenCalledWith({ nickname: 'Scout' });
    expect(occurrences).toHaveBeenCalledWith([]);
  });

  it('preserves a non-transient refresh failure and allows a later refresh attempt', () => {
    const failed = vi.fn();
    http.get(profileUrl).subscribe({ error: failed });
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests
      .expectOne(SESSION_REFRESH_URL)
      .flush(null, { status: 403, statusText: 'Forbidden' });
    expect(failed.mock.calls[0][0].status).toBe(403);

    http.get(profileUrl).subscribe();
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests.expectOne(SESSION_REFRESH_URL).flush({});
    requests.expectOne(profileUrl).flush({});
  });

  it.each([401, 403])(
    'preserves a retried request failure (%i) without refreshing again',
    (status) => {
      const failed = vi.fn();
      http.get(profileUrl).subscribe({ error: failed });
      requests
        .expectOne(profileUrl)
        .flush(null, { status: 401, statusText: 'Unauthorized' });
      requests.expectOne(SESSION_REFRESH_URL).flush({});
      requests
        .expectOne(profileUrl)
        .flush(null, { status, statusText: 'Failed' });
      expect((failed.mock.calls[0][0] as HttpErrorResponse).status).toBe(
        status,
      );
      requests.expectNone(SESSION_REFRESH_URL);
    },
  );

  it('does not refresh a failed refresh request or an unrelated API', () => {
    for (const url of [SESSION_REFRESH_URL, 'https://other.example/user']) {
      const failed = vi.fn();
      http.get(url).subscribe({ error: failed });
      requests
        .expectOne(url)
        .flush(null, { status: 401, statusText: 'Unauthorized' });
      expect(failed).toHaveBeenCalledOnce();
      requests.expectNone(SESSION_REFRESH_URL);
    }
  });
  it.each([profileUrl, occurrencesUrl])(
    'recovers a temporary initial failure at %s without navigation',
    (url) => {
      vi.useFakeTimers();
      const result = vi.fn();
      const failed = vi.fn();
      http
        .get(url, { withCredentials: true })
        .subscribe({ next: result, error: failed });
      requests
        .expectOne(url)
        .flush(null, { status: 503, statusText: 'Unavailable' });
      expect(failed).not.toHaveBeenCalled();
      vi.advanceTimersByTime(500);
      const retry = requests.expectOne(url);
      expect(retry.request.withCredentials).toBe(true);
      retry.flush({ recovered: true });
      expect(result).toHaveBeenCalledWith({ recovered: true });
      expect(failed).not.toHaveBeenCalled();
    },
  );

  it('recovers when session refresh is briefly unavailable during startup', () => {
    vi.useFakeTimers();
    const result = vi.fn();
    http.get(profileUrl).subscribe(result);
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests
      .expectOne(SESSION_REFRESH_URL)
      .flush(null, { status: 503, statusText: 'Unavailable' });
    vi.advanceTimersByTime(500);
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests.expectOne(SESSION_REFRESH_URL).flush({});
    requests.expectOne(profileUrl).flush({ nickname: 'Scout' });
    expect(result).toHaveBeenCalledWith({ nickname: 'Scout' });
  });

  it('surfaces a persistent outage after two retries', () => {
    vi.useFakeTimers();
    const failed = vi.fn();
    http.get(occurrencesUrl).subscribe({ error: failed });
    for (const delay of [500, 1000]) {
      requests
        .expectOne(occurrencesUrl)
        .flush(null, { status: 503, statusText: 'Unavailable' });
      expect(failed).not.toHaveBeenCalled();
      vi.advanceTimersByTime(delay);
    }
    requests
      .expectOne(occurrencesUrl)
      .flush(null, { status: 503, statusText: 'Unavailable' });
    expect(failed).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(10000);
    requests.expectNone(occurrencesUrl);
  });

  it('does not retry mutations or unrelated reads', () => {
    vi.useFakeTimers();
    const failed = vi.fn();
    http.post(occurrencesUrl, {}).subscribe({ error: failed });
    requests
      .expectOne(occurrencesUrl)
      .flush(null, { status: 503, statusText: 'Unavailable' });
    http.get(`${environment.scoutUrl}/other`).subscribe({ error: failed });
    requests
      .expectOne(`${environment.scoutUrl}/other`)
      .flush(null, { status: 503, statusText: 'Unavailable' });
    vi.advanceTimersByTime(10000);
    expect(failed).toHaveBeenCalledTimes(2);
    requests.expectNone(occurrencesUrl);
    requests.expectNone(`${environment.scoutUrl}/other`);
  });

  it('cancels a scheduled retry when the read is cancelled', () => {
    vi.useFakeTimers();
    const subscription = http.get(occurrencesUrl).subscribe();
    requests
      .expectOne(occurrencesUrl)
      .flush(null, { status: 503, statusText: 'Unavailable' });
    subscription.unsubscribe();
    vi.advanceTimersByTime(10000);
    requests.expectNone(occurrencesUrl);
  });
});
