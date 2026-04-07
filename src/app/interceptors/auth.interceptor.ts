import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const refreshUrl = `${environment.rangoUrl}/auth/refresh/web`;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only handle 401s, and never retry the refresh call itself.
      if (error.status !== 401 || req.url === refreshUrl) {
        return throwError(() => error);
      }

      return http
        .post(refreshUrl, {}, { withCredentials: true })
        .pipe(
          switchMap(() => next(req)),
          catchError(() => throwError(() => error)),
        );
    }),
  );
};
