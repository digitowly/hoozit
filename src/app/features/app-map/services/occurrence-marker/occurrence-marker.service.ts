import { effect, inject, Injectable, signal, untracked } from '@angular/core';
import { SearchResultSelectionService } from '../../../search/services/search-result-selection/search-result-selection.service';
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
  OccurrenceSearchResponse,
  OccurrenceSearchResult,
} from '../../../../services/occurrence/occurrence-search/occurrence-search.model';

interface CreateMarkersOptions {
  force?: boolean;
  radiusLevel?: OccurrenceSearchRadiusLevel;
  onComplete?: () => void;
}

export type MarkerLoadState = 'complete' | 'loading';

interface MarkerSearchContext {
  location: Coordinate;
  selections: AnimalSearchResult[];
  radiusLevel: OccurrenceSearchRadiusLevel;
  locationChanged: boolean;
  radiusLevelChanged: boolean;
  cacheKey: string;
}

interface ActiveMarkerFetch {
  mapService: MapService;
  search: MarkerSearchContext;
  onCreate: (marker: MapMarker) => void;
  onComplete?: () => void;
  loadingStarted: boolean;
  markersCleared: boolean;
}

@Injectable({ providedIn: 'root' })
export class OccurrenceMarkerService {
  private occurrenceSearch = inject(OccurrenceSearchService);
  private selectionsService = inject(SearchResultSelectionService);
  private lastSearchCoordinate: Coordinate | null = null;
  private lastRadiusLevel: OccurrenceSearchRadiusLevel | null = null;
  private lastSelections: AnimalSearchResult[] = [];

  private readonly markersStore = new Map<string, MapMarker[]>();
  private readonly activeFetch = signal<ActiveMarkerFetch | null>(null);

  readonly activeRadiusLevel = signal<OccurrenceSearchRadiusLevel>(
    OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  );
  readonly lastLoadFailed = signal(false);

  constructor() {
    effect(() => {
      const activeFetch = this.activeFetch();
      if (!activeFetch) return;

      const isLoading = this.occurrenceSearch.resource.isLoading();
      if (isLoading) {
        if (!activeFetch.loadingStarted) {
          untracked(() =>
            this.activeFetch.update((current) =>
              current === activeFetch
                ? { ...activeFetch, loadingStarted: true }
                : current,
            ),
          );
        }
        return;
      }

      if (!activeFetch.loadingStarted) return;

      const response = this.occurrenceSearch.resource.value();
      untracked(() => this.renderFetchedMarkers(activeFetch, response));
    });
  }

  createMarkers(
    mapService: MapService,
    location: Coordinate,
    onCreate: (marker: MapMarker) => void,
    options?: CreateMarkersOptions,
  ): MarkerLoadState {
    const search = this.createSearchContext(location, options);

    if (this.canKeepCurrentMarkers(search, options)) {
      mapService.repaintUserMarker(search.location);
      options?.onComplete?.();
      return 'complete';
    }

    this.invalidateCacheForNewSearchArea(search);
    mapService.removeMarkers();

    if (search.selections.length === 0) {
      this.finishWithoutMarkers(mapService, search);
      options?.onComplete?.();
      return 'complete';
    }

    const storedMarkers = this.cachedMarkers(search.cacheKey, options);
    if (storedMarkers) {
      return this.renderCachedMarkers(
        storedMarkers,
        mapService,
        search,
        onCreate,
        options?.onComplete,
      );
    }

    this.fetchMarkers(search, mapService, onCreate, options?.onComplete);
    return 'loading';
  }

  cancelActiveFetch() {
    this.activeFetch.set(null);
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

  private invalidateCacheForNewSearchArea(search: MarkerSearchContext) {
    if (!search.locationChanged && !search.radiusLevelChanged) return;
    this.markersStore.clear();
  }

  private activateSearchArea(search: MarkerSearchContext) {
    this.lastSelections = search.selections;
    this.lastSearchCoordinate = search.location;
    this.lastRadiusLevel = search.radiusLevel;
    this.activeRadiusLevel.set(search.radiusLevel);
  }

  private finishWithoutMarkers(
    mapService: MapService,
    search: MarkerSearchContext,
  ) {
    this.activateSearchArea(search);
    this.lastLoadFailed.set(false);
    mapService.repaintUserMarker(search.location);
  }

  private cachedMarkers(key: string, options?: CreateMarkersOptions) {
    return !options?.force ? this.markersStore.get(key) : undefined;
  }

  private renderCachedMarkers(
    markers: MapMarker[],
    mapService: MapService,
    search: MarkerSearchContext,
    onCreate: (marker: MapMarker) => void,
    onComplete?: () => void,
  ) {
    this.activateSearchArea(search);
    this.lastLoadFailed.set(false);
    markers.forEach((marker) => onCreate(marker));
    mapService.repaintUserMarker(search.location);
    onComplete?.();
    return 'complete' as const;
  }

  private fetchMarkers(
    search: MarkerSearchContext,
    mapService: MapService,
    onCreate: (marker: MapMarker) => void,
    onComplete?: () => void,
  ) {
    this.activeFetch.set({
      mapService,
      search,
      onCreate,
      onComplete,
      loadingStarted: false,
      markersCleared: true,
    });

    this.occurrenceSearch.search(
      search.location,
      search.selections.map((selection) => selection.taxonKey),
      search.radiusLevel,
    );
  }

  private renderFetchedMarkers(
    activeFetch: ActiveMarkerFetch,
    response: OccurrenceSearchResponse | null,
  ) {
    const { mapService, search, onCreate, onComplete } = activeFetch;
    const failed = response === null;

    if (response) {
      this.activateSearchArea(search);
      this.replaceMarkerCache(search.cacheKey);
      if (!activeFetch.markersCleared) mapService.removeMarkers();
      response.results
        .map((occurrence) =>
          this.createMapMarkerData(occurrence, search.selections),
        )
        .forEach((marker) => {
          this.storeMarker(search.cacheKey, marker);
          onCreate(marker);
        });
    }

    this.lastLoadFailed.set(failed);
    mapService.repaintUserMarker(search.location);
    this.activeFetch.set(
      activeFetch.onComplete
        ? {
            ...activeFetch,
            onComplete: undefined,
            loadingStarted: false,
            markersCleared: false,
          }
        : { ...activeFetch, loadingStarted: false, markersCleared: false },
    );
    onComplete?.();
  }

  private createMapMarkerData(
    occurrence: OccurrenceSearchResult,
    selections: AnimalSearchResult[],
  ): MapMarker {
    const selection = this.findSelectionForOccurrence(occurrence, selections);

    return {
      coordinate: {
        latitude: occurrence.location.latitude,
        longitude: occurrence.location.longitude,
      },
      icon: selection?.thumbnail ?? '',
      content: {
        title: selection?.name ?? occurrence.name.display,
        scientificName: occurrence.name.scientific,
        source: occurrence.source,
        author: occurrence.author?.nickname,
        date: occurrence.observed_at,
      },
    };
  }

  private findSelectionForOccurrence(
    occurrence: OccurrenceSearchResult,
    selections: AnimalSearchResult[],
  ): AnimalSearchResult | null {
    if (!occurrence.taxon_key) {
      return null;
    }

    const taxonMatch = selections.find(
      (selection) => selection.taxonKey === occurrence.taxon_key,
    );

    return taxonMatch ?? null;
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

  private replaceMarkerCache(key: string) {
    this.markersStore.set(key, []);
  }
}
