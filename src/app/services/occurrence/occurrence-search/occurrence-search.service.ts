import { Injectable, resource, signal } from '@angular/core';
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
  private readonly apiUrl = `${environment.scoutUrl}/occurrences/search`;

  private readonly searchRequest = signal<OccurrenceSearchRequest | undefined>(
    undefined,
  );

  readonly error = signal<string | null>(null);
  readonly resource = resource<
    OccurrenceSearchResponse | null,
    OccurrenceSearchRequest | undefined
  >({
    params: () => this.searchRequest(),
    defaultValue: null,
    loader: ({ params, abortSignal }) =>
      this.fetchOccurrences(params, abortSignal),
  });
  readonly isLoading = this.resource.isLoading;

  search(
    coordinate: Coordinate,
    taxonKeys: string[],
    radiusLevel: OccurrenceSearchRadiusLevel = OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  ) {
    this.error.set(null);
    this.searchRequest.set({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      radius_level: radiusLevel,
      taxon_keys: taxonKeys,
    });
  }

  private async fetchOccurrences(
    body: OccurrenceSearchRequest,
    abortSignal: AbortSignal,
  ): Promise<OccurrenceSearchResponse | null> {
    this.error.set(null);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortSignal,
      });

      if (!response.ok) {
        return handleHttpError({ status: response.status }, this.error.set);
      }

      return (await response.json()) as OccurrenceSearchResponse;
    } catch {
      if (abortSignal.aborted) return null;
      return handleHttpError({ status: 0 }, this.error.set);
    }
  }
}
