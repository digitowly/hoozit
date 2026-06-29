import { inject, Injectable, signal } from '@angular/core';
import { SearchResultSelectionService } from '../../../search/services/search-result-selection/search-result-selection.service';
import {
  filter,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  of,
  tap,
} from 'rxjs';
import { Coordinate } from '../../../../model/coordinate';
import { MapMarker, MapService } from '../../../../services/map/map-service';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { GeoHelper } from '../../../../utils/geo/geo-helper';
import { OccurrenceSearchService } from '../../../../services/occurrence/occurrence-search/occurrence-search.service';
import {
  OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  largerOccurrenceSearchRadiusLevel,
  occurrenceSearchRadiusMetersForLevel,
  OccurrenceSearchRadiusLevel,
  OccurrenceSearchResult,
} from '../../../../services/occurrence/occurrence-search/occurrence-search.model';

interface CreateMarkersOptions {
  force?: boolean;
  radiusLevel?: OccurrenceSearchRadiusLevel;
}

interface MarkerSearchContext {
  location: Coordinate;
  selections: AnimalSearchResult[];
  radiusLevel: OccurrenceSearchRadiusLevel;
  locationChanged: boolean;
  radiusLevelChanged: boolean;
  cacheKey: string;
}

@Injectable({ providedIn: 'root' })
export class OccurrenceMarkerService {
  private occurrenceSearch = inject(OccurrenceSearchService);
  private selectionsService = inject(SearchResultSelectionService);
  private lastSearchCoordinate: Coordinate | null = null;
  private lastRadiusLevel: OccurrenceSearchRadiusLevel | null = null;
  private lastSelections: AnimalSearchResult[] = [];

  private readonly markersStore = new Map<string, MapMarker[]>();

  readonly activeRadiusLevel = signal<OccurrenceSearchRadiusLevel>(
    OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  );
  readonly lastLoadFailed = signal(false);

  createMarkers(
    mapService: MapService,
    location: Coordinate,
    onCreate: (marker: MapMarker) => void,
    options?: CreateMarkersOptions,
  ): Observable<MapMarker> {
    const search = this.createSearchContext(location, options);

    if (this.canKeepCurrentMarkers(search, options)) {
      return of();
    }

    this.rememberSelections(search.selections);
    this.rememberSearchArea(search);
    mapService.removeMarkers();

    if (search.selections.length === 0) {
      return this.finishWithoutMarkers(mapService, search.location);
    }

    const storedMarkers = this.cachedMarkers(search.cacheKey, options);
    if (storedMarkers) {
      return this.renderCachedMarkers(
        storedMarkers,
        mapService,
        search.location,
        onCreate,
      );
    }

    return this.fetchMarkers(search, mapService, onCreate);
  }

  private createSearchContext(
    location: Coordinate,
    options?: CreateMarkersOptions,
  ): MarkerSearchContext {
    const requestedRadiusLevel =
      options?.radiusLevel ?? OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL;
    const locationChanged = this.hasLocationChangedSignificantly(
      location,
      this.lastRadiusLevel ?? requestedRadiusLevel,
    );
    const radiusLevel = this.resolveRadiusLevel(
      requestedRadiusLevel,
      locationChanged,
    );
    const selections = this.selectionsService.selections();

    this.activeRadiusLevel.set(radiusLevel);

    return {
      location,
      selections,
      radiusLevel,
      locationChanged,
      radiusLevelChanged: this.lastRadiusLevel !== radiusLevel,
      cacheKey: this.markerCacheKey(selections, radiusLevel),
    };
  }

  private canKeepCurrentMarkers(
    search: MarkerSearchContext,
    options?: CreateMarkersOptions,
  ) {
    return (
      !options?.force &&
      !search.locationChanged &&
      !search.radiusLevelChanged &&
      this.selectionsService.hasIdenticalSelections(this.lastSelections)
    );
  }

  private rememberSelections(selections: AnimalSearchResult[]) {
    this.lastSelections = selections;
  }

  private rememberSearchArea(search: MarkerSearchContext) {
    if (!search.locationChanged && !search.radiusLevelChanged) return;

    this.lastSearchCoordinate = search.location;
    this.lastRadiusLevel = search.radiusLevel;
    this.markersStore.clear();
  }

  private finishWithoutMarkers(mapService: MapService, location: Coordinate) {
    this.lastLoadFailed.set(false);
    mapService.repaintUserMarker(location);
    return of();
  }

  private cachedMarkers(key: string, options?: CreateMarkersOptions) {
    return !options?.force ? this.markersStore.get(key) : undefined;
  }

  private renderCachedMarkers(
    markers: MapMarker[],
    mapService: MapService,
    location: Coordinate,
    onCreate: (marker: MapMarker) => void,
  ) {
    this.lastLoadFailed.set(false);
    return from(markers).pipe(
      tap((marker) => onCreate(marker)),
      finalize(() => mapService.repaintUserMarker(location)),
    );
  }

  private fetchMarkers(
    search: MarkerSearchContext,
    mapService: MapService,
    onCreate: (marker: MapMarker) => void,
  ) {
    let failed = false;

    return this.occurrenceSearch
      .search(
        search.location,
        search.selections.map((selection) => selection.taxonKey),
        search.radiusLevel,
      )
      .pipe(
        tap((response) => (failed = response === null)),
        filter(
          (response): response is NonNullable<typeof response> =>
            response !== null,
        ),
        mergeMap((response) => from(response.results)),
        map((occurrence) =>
          this.createMapMarkerData(occurrence, search.selections),
        ),
        tap((marker) => this.storeMarker(search.cacheKey, marker)),
        tap((marker) => onCreate(marker)),
        finalize(() => {
          this.lastLoadFailed.set(failed);
          mapService.repaintUserMarker(search.location);
        }),
      );
  }

  private createMapMarkerData(
    occurrence: OccurrenceSearchResult,
    selections: AnimalSearchResult[],
  ): MapMarker {
    return {
      coordinate: {
        latitude: occurrence.location.latitude,
        longitude: occurrence.location.longitude,
      },
      icon: selections.length === 1 ? (selections[0].thumbnail ?? '') : '',
      content: {
        title: occurrence.name.display,
        scientificName: occurrence.name.scientific,
        source: occurrence.source,
        author: occurrence.author?.nickname,
        date: occurrence.observed_at,
      },
    };
  }

  private hasLocationChangedSignificantly(
    currentCoordinate: Coordinate,
    radiusLevel: OccurrenceSearchRadiusLevel,
  ) {
    const cacheThresholdKm =
      occurrenceSearchRadiusMetersForLevel(radiusLevel) / 2 / 1_000;
    return (
      !this.lastSearchCoordinate ||
      GeoHelper.getDistance(currentCoordinate, this.lastSearchCoordinate) >=
        cacheThresholdKm
    );
  }

  private resolveRadiusLevel(
    requestedRadiusLevel: OccurrenceSearchRadiusLevel,
    locationChanged: boolean,
  ): OccurrenceSearchRadiusLevel {
    if (!locationChanged && this.lastRadiusLevel !== null) {
      return largerOccurrenceSearchRadiusLevel(
        requestedRadiusLevel,
        this.lastRadiusLevel,
      );
    }
    return requestedRadiusLevel;
  }

  private markerCacheKey(
    selections: AnimalSearchResult[],
    radiusLevel: OccurrenceSearchRadiusLevel,
  ): string {
    const taxonKeys = selections
      .map((selection) => selection.taxonKey)
      .sort()
      .join(',');
    return `${radiusLevel}:${taxonKeys}`;
  }

  private storeMarker(key: string, marker: MapMarker) {
    this.markersStore.set(key, [...(this.markersStore.get(key) ?? []), marker]);
  }
}
