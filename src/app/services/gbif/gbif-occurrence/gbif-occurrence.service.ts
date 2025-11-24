import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of } from 'rxjs';
import { HttpErrorService } from '../../http-error/http-error.service';
import { Coordinate } from '../../../model/coordinate';
import { GbifOccurrenceResponse } from './gbif-occurrence.model';
import { environment } from '../../../../environments/environment';
import { GeoService } from '../../geo/geo.service';

@Injectable({ providedIn: 'root' })
export class GbifOccurrenceService {
  private baseUrl = `${environment.gbifUrl}/occurrence`;

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  public readonly CACHE_THRESHOLD_KM = 1;

  private cache = new Map<
    string,
    { coordinate: Coordinate; response: GbifOccurrenceResponse }
  >();

  constructor(
    private http: HttpClient,
    private httpErrorService: HttpErrorService,
    private geo: GeoService,
  ) {}

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
      this.geo.getDistance(coordinate, cached.coordinate) <
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

    return this.http
      .get<GbifOccurrenceResponse>(`${this.baseUrl}/search?${this.urlParams}`)
      .pipe(
        catchError((error) => {
          this.httpErrorService.handleError(error, (message) =>
            this.error.set(message),
          );
          return of(null);
        }),
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
