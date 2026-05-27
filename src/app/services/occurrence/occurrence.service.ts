import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserOccurrenceRequest } from './occurrence.model';

@Injectable({ providedIn: 'root' })
export class OccurrenceService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.scoutUrl}/user/occurrence`;

  readonly submissionState = signal<SubmissionState>(SubmissionState.INITIAL);

  private readonly httpOptions = {
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
  };

  submit(payload: UserOccurrenceRequest): Observable<void> {
    this.submissionState.set(SubmissionState.LOADING);
    return this.http.post<void>(this.apiUrl, payload, this.httpOptions).pipe(
      tap({
        next: () => this.submissionState.set(SubmissionState.SUCCESS),
        error: () => this.submissionState.set(SubmissionState.ERROR),
      }),
    );
  }

  reset() {
    this.submissionState.set(SubmissionState.INITIAL);
  }
}

export enum SubmissionState {
  INITIAL = 'INITIAL',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
