import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, switchMap, throwError, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SESSION_REFRESH_URL,
  SessionRefreshService,
} from '../services/session-refresh/session-refresh.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionRefresh = inject(SessionRefreshService);

  const isUserRead =
    req.method === 'GET' &&
    [
      `${environment.scoutUrl}/users/me/profile`,
      `${environment.scoutUrl}/user/occurrences`,
    ].includes(req.url);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status !== 401 ||
        req.url === SESSION_REFRESH_URL ||
        !req.url.startsWith(`${environment.scoutUrl}/`)
      ) {
        return throwError(() => error);
      }

      return sessionRefresh.refresh().pipe(switchMap(() => next(req)));
    }),
    // Keep user views loading through short network/server outages, including
    // an unavailable session refresh. Never replay mutations or retry denial.
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount) =>
        isUserRead && [0, 500, 502, 503, 504].includes(error.status)
          ? timer(500 * retryCount)
          : throwError(() => error),
    }),
  );
};
