import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SESSION_REFRESH_URL,
  SessionRefreshService,
} from '../services/session-refresh/session-refresh.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionRefresh = inject(SessionRefreshService);

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
  );
};
