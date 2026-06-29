import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Coordinate } from '../../../model/coordinate';
import { handleHttpError } from '../../../utils/http-error/http-error';
import {
  OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  OccurrenceSearchRadiusLevel,
  OccurrenceSearchRequest,
  OccurrenceSearchResponse,
} from './occurrence-search.model';

@Injectable({ providedIn: 'root' })
export class OccurrenceSearchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.scoutUrl}/occurrences/search`;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  search(
    coordinate: Coordinate,
    taxonKeys: string[],
    radiusLevel: OccurrenceSearchRadiusLevel = OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  ): Observable<OccurrenceSearchResponse | null> {
    const body: OccurrenceSearchRequest = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      radius_level: radiusLevel,
      taxon_keys: taxonKeys,
    };

    this.isLoading.set(true);
    return this.http
      .post<OccurrenceSearchResponse>(this.apiUrl, body, {
        withCredentials: true,
      })
      .pipe(
        catchError((error) => of(handleHttpError(error, this.error.set))),
        finalize(() => this.isLoading.set(false)),
      );
  }
}
