import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { OccurrenceResponse } from '../../model/occurrence';
import { catchError, finalize, Observable, of } from 'rxjs';
import { HttpErrorService } from '../http-error-service/http-error.service';

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

  constructor(
    private http: HttpClient,
    private httpErrorService: HttpErrorService
  ) {}

  getOccurrences(name: string): Observable<OccurrenceResponse> {
    this.isLoading.set(true);
    const url = `${this.apiUrl}/animals/search?q=${name}&lang=de`;
    return this.http.get<OccurrenceResponse>(url, this.httpOptions).pipe(
      catchError((err) => {
        this.httpErrorService.handleError(err, (message) =>
          this.error.set(message)
        );
        return of({ data: [] });
      }),
      finalize(() => this.isLoading.set(false))
    );
  }
}
