import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { SessionRefreshService } from './session-refresh.service';

describe('SessionRefreshService', () => {
  const refreshUrl = `${environment.scoutUrl}/auth/refresh/web`;
  let service: SessionRefreshService;
  let requests: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionRefreshService);
    requests = TestBed.inject(HttpTestingController);
  });

  afterEach(() => requests.verify());

  it('posts an empty body with credentials to refresh the session', () => {
    service.refresh().subscribe();

    const request = requests.expectOne(refreshUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('shares one in-flight request between callers', () => {
    const first = vi.fn();
    const second = vi.fn();
    service.refresh().subscribe(first);
    service.refresh().subscribe(second);

    requests.expectOne(refreshUrl).flush({ refreshed: true });

    expect(first).toHaveBeenCalledExactlyOnceWith({ refreshed: true });
    expect(second).toHaveBeenCalledExactlyOnceWith({ refreshed: true });
  });

  it('starts a new request after the previous refresh completes', () => {
    service.refresh().subscribe();
    requests.expectOne(refreshUrl).flush({});

    service.refresh().subscribe();
    requests.expectOne(refreshUrl).flush({});
  });

  it('propagates failures to all callers and allows a later refresh', () => {
    const firstError = vi.fn();
    const secondError = vi.fn();
    service.refresh().subscribe({ error: firstError });
    service.refresh().subscribe({ error: secondError });

    requests.expectOne(refreshUrl).flush(null, {
      status: 503,
      statusText: 'Service Unavailable',
    });

    expect(firstError).toHaveBeenCalledOnce();
    expect(secondError).toHaveBeenCalledOnce();
    const error = firstError.mock.calls[0][0] as HttpErrorResponse;
    expect(error.status).toBe(503);
    expect(secondError).toHaveBeenCalledWith(error);

    service.refresh().subscribe();
    requests.expectOne(refreshUrl).flush({});
  });

  it('keeps the refresh running when a caller unsubscribes', () => {
    const subscription = service.refresh().subscribe();
    const request = requests.expectOne(refreshUrl);

    subscription.unsubscribe();
    expect(request.cancelled).toBe(false);

    const nextCaller = vi.fn();
    service.refresh().subscribe(nextCaller);
    requests.expectNone(refreshUrl);
    request.flush({ refreshed: true });

    expect(nextCaller).toHaveBeenCalledExactlyOnceWith({ refreshed: true });
  });
});
