import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { finalize, Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export const SESSION_REFRESH_URL = `${environment.scoutUrl}/auth/refresh/web`;

@Injectable({ providedIn: 'root' })
export class SessionRefreshService {
  private readonly http = inject(HttpClient);
  private pendingRefresh: Observable<unknown> | undefined;

  refresh(): Observable<unknown> {
    this.pendingRefresh ??= this.http
      .post(SESSION_REFRESH_URL, {}, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.pendingRefresh = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.pendingRefresh;
  }
}
