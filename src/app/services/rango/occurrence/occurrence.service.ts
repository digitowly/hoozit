import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserOccurrenceRequest } from './occurrence.model';

@Injectable({ providedIn: 'root' })
export class OccurrenceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.rangoUrl}/user/occurrence`;

  readonly submissionState = signal<
    'initial' | 'loading' | 'success' | 'error'
  >('initial');

  private readonly httpOptions = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  };

  submit(payload: UserOccurrenceRequest): Observable<void> {
    this.submissionState.set('loading');
    return this.http.post<void>(this.apiUrl, payload, this.httpOptions).pipe(
      tap({
        next: () => this.submissionState.set('success'),
        error: () => this.submissionState.set('error'),
      }),
    );
  }

  reset() {
    this.submissionState.set('initial');
  }
}
