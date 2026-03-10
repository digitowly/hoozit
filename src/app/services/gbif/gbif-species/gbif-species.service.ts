import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { GbifSpecies } from './gbif-species.model';
import { catchError, finalize, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { handleHttpError } from '../../../utils/http-error/http-error';

@Injectable({ providedIn: 'root' })
export class GbifSpeciesService {
  private readonly httpClient = inject(HttpClient);

  private baseUrl = `${environment.gbifUrl}/species`;

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  get(taxonKey: number): Observable<GbifSpecies | null> {
    this.isLoading.set(true);
    return this.httpClient
      .get<GbifSpecies>(`${this.baseUrl}/match/${taxonKey}`)
      .pipe(
        catchError((error) => {
          handleHttpError(error, this.error.set);
          return of(null);
        }),
        finalize(() => this.isLoading.set(false)),
      );
  }
}
