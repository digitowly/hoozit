import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { GbifSpecies } from './gbif-species.model';
import { catchError, finalize, Observable, of } from 'rxjs';
import { HttpErrorService } from '../../http-error/http-error.service';

@Injectable({
  providedIn: 'root',
})
export class GbifSpeciesService {
  private baseUrl = 'https://api.gbif.org/v1';

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private httpErrorService: HttpErrorService
  ) {}

  getSpecies(taxonKey: number): Observable<GbifSpecies | null> {
    this.isLoading.set(true);
    return this.http
      .get<GbifSpecies>(`${this.baseUrl}/species/match/${taxonKey}`)
      .pipe(
        catchError((error) => {
          this.httpErrorService.handleError(error, (message) =>
            this.error.set(message)
          );
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      );
  }
}
