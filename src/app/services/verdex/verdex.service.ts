import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { OccurrenceResponse } from '../../model/occurrence';
import { catchError, finalize, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VerdexService {
  private readonly apiUrl = 'http://localhost:8082/api';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Api-Key': 'secret',
    }),
  };

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getOccurrences(name: string): Observable<OccurrenceResponse> {
    this.isLoading.set(true);
    const url = `${this.apiUrl}/animals/search?q=${name}&lang=de`;
    return this.http.get<OccurrenceResponse>(url, this.httpOptions).pipe(
      catchError((err) => this.handleError(err)),
      finalize(() => this.isLoading.set(false))
    );
  }

  private handleError(err: { status: number }) {
    if (err.status === 0) {
      console.error('Network error:', err);
      this.error.set('Network error: Please check your connection');
      return of({ data: [] });
    }

    if (err.status >= 400 && err.status < 500) {
      console.error('Client error:', err);
      this.error.set('Client error: Invalid request');
      return of({ data: [] });
    }

    if (err.status >= 500) {
      console.error('Server error:', err);
      this.error.set('Server error: Please try again later');
      return of({ data: [] });
    }

    console.error('Error fetching occurrences:', err);
    this.error.set('Services is currently unavailable');
    return of({ data: [] });
  }
}
