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

  afterEach(() => requests.verify());

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

  it('preserves a refresh failure and allows a later refresh attempt', () => {
    const failed = vi.fn();
    http.get(profileUrl).subscribe({ error: failed });
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests
      .expectOne(SESSION_REFRESH_URL)
      .flush(null, { status: 503, statusText: 'Unavailable' });
    expect(failed.mock.calls[0][0].status).toBe(503);

    http.get(profileUrl).subscribe();
    requests
      .expectOne(profileUrl)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    requests.expectOne(SESSION_REFRESH_URL).flush({});
    requests.expectOne(profileUrl).flush({});
  });

  it.each([401, 503])(
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
});
