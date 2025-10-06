import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { AnimalSearchResponse } from './animal-search.model';
import { catchError, finalize, Observable, of } from 'rxjs';
import { HttpErrorService } from '../http-error/http-error.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnimalSearchService {
  private readonly apiUrl = `${environment.verdexUrl}/animals/search`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private httpErrorService: HttpErrorService
  ) {}

  getOccurrences(name: string): Observable<AnimalSearchResponse> {
    this.isLoading.set(true);
    const url = `${this.apiUrl}?q=${name}&lang=de`;
    return this.http.get<AnimalSearchResponse>(url, this.httpOptions).pipe(
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
