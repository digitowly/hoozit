import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of } from 'rxjs';
import { Coordinate } from '../../../model/coordinate';
import {
  GbifOccurrenceResponse,
  GbifOccurrenceResponseCache,
} from './gbif-occurrence.model';
import { environment } from '../../../../environments/environment';
import { GeoHelper } from '../../../utils/geo/geo-helper';
import { handleHttpError } from '../../../utils/http-error/http-error';

@Injectable({ providedIn: 'root' })
export class GbifOccurrenceService {
  private readonly httpClient = inject(HttpClient);

  private baseUrl = `${environment.gbifUrl}/occurrence`;

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  public readonly CACHE_THRESHOLD_KM = 1;

  private readonly cache = new Map<string, GbifOccurrenceResponseCache>();

  private readonly urlParams = new URLSearchParams({
    hasCoordinate: 'true',
    limit: '300',
  });

  search(
    taxonKey: string,
    coordinate: Coordinate,
  ): Observable<GbifOccurrenceResponse | null> {
    const cached = this.cache.get(taxonKey);
    if (
      cached &&
      GeoHelper.getDistance(coordinate, cached.coordinate) <
        this.CACHE_THRESHOLD_KM
    ) {
      return of(cached.response);
    }

    this.isLoading.set(true);

    this.urlParams.set('taxonKey', taxonKey);

    this.urlParams.set(
      'geometry',
      this.createCoordinatePolygon(coordinate, 0.1),
    );

    return this.httpClient
      .get<GbifOccurrenceResponse>(`${this.baseUrl}/search?${this.urlParams}`)
      .pipe(
        catchError((err) => of(handleHttpError(err, this.error.set))),
        finalize(() => this.isLoading.set(false)),
      );
  }

  private createCoordinatePolygon(
    coordinate: Coordinate,
    radius: number,
  ): string {
    return `POLYGON((${coordinate.longitude - radius} ${
      coordinate.latitude - radius
    }, ${coordinate.longitude + radius} ${coordinate.latitude - radius}, ${
      coordinate.longitude + radius
    } ${coordinate.latitude + radius}, ${coordinate.longitude - radius} ${
      coordinate.latitude + radius
    }, ${coordinate.longitude - radius} ${coordinate.latitude - radius}))`;
  }
}
