import { inject, Injectable } from '@angular/core';
import { GbifOccurrenceService } from '../../../../services/gbif/gbif-occurrence/gbif-occurrence.service';
import { SearchResultSelectionService } from '../../../search/services/search-result-selection/search-result-selection.service';
import { filter, finalize, from, map, mergeMap, of, tap } from 'rxjs';
import { Coordinate } from '../../../../model/coordinate';
import { MapMarker, MapService } from '../../../../services/map/map-service';
import { GbifOccurrence } from '../../../../services/gbif/gbif-occurrence/gbif-occurrence.model';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { GeoHelper } from '../../../../utils/geo/geo-helper';

type MapMarkerData = {
  timestamp: number;
  marker: MapMarker;
};

@Injectable({ providedIn: 'root' })
export class OccurrenceMarkerService {
  private gbifService = inject(GbifOccurrenceService);
  private selectionsService = inject(SearchResultSelectionService);
  private lastSearchCoordinate: Coordinate | null = null;
  private lastSelections: AnimalSearchResult[] = [];

  markersStore = new Map<number, MapMarkerData[]>();

  createMarkers(
    mapService: MapService,
    location: Coordinate,
    onCreate: (marker: MapMarker) => void,
  ) {
    const currentCoordinate = location;

    if (
      !this.hasLocationChangedSignificantly(currentCoordinate) &&
      this.selectionsService.hasIdenticalSelections(this.lastSelections)
    ) {
      return of();
    }

    this.lastSelections = this.selectionsService.selections();

    if (this.hasLocationChangedSignificantly(currentCoordinate)) {
      this.lastSearchCoordinate = currentCoordinate;
    }

    mapService.removeMarkers();

    return of(this.selectionsService.selections()).pipe(
      mergeMap((selections) => from(selections)),

      mergeMap((selection) => {
        const storedMarkers = this.getStoredMarkers(selection.id);

        const shouldReturnStoredMarkers =
          storedMarkers.length > 0 &&
          !this.hasLocationChangedSignificantly(currentCoordinate);

        if (shouldReturnStoredMarkers) {
          return from(storedMarkers).pipe(tap((marker) => onCreate(marker)));
        }

        return this.gbifService.search(selection.gbif_key, location).pipe(
          filter((response) => !!response),
          mergeMap((response) => response.results),
          map((occurrence) => this.createMapMarkerData(occurrence, selection)),
          tap((marker) => this.storeMarker(selection.id, marker)),
          tap((marker) => onCreate(marker)),
        );
      }),

      finalize(() => mapService.repaintUserMarker(location)),
    );
  }

  private createMapMarkerData(
    occurrence: GbifOccurrence,
    selection: AnimalSearchResult,
  ): MapMarker {
    return {
      coordinate: {
        latitude: occurrence.decimalLatitude,
        longitude: occurrence.decimalLongitude,
      },
      icon: selection.thumbnail ?? '',
      content: {
        title: selection.name,
        scientificName: selection.binomial_name,
        loyalty: occurrence.locality,
        date: occurrence.eventDate,
        institutionCode: occurrence.institutionCode,
      },
    };
  }

  private hasLocationChangedSignificantly(currentCoordinate: Coordinate) {
    return (
      !this.lastSearchCoordinate ||
      GeoHelper.getDistance(currentCoordinate, this.lastSearchCoordinate) >=
        this.gbifService.CACHE_THRESHOLD_KM
    );
  }

  private getStoredMarkers(key: number): MapMarker[] {
    const storedData = sessionStorage.getItem(key.toString());
    if (storedData) {
      const data: MapMarkerData[] = JSON.parse(storedData);
      return data.map(({ marker }) => marker);
    }

    const data = this.markersStore.get(key) || [];
    return data.map(({ marker }) => marker);
  }

  private storeMarker(key: number, marker: MapMarker) {
    const data = this.markersStore.get(key) || [];
    this.markersStore.set(key, [...data, { timestamp: Date.now(), marker }]);
    sessionStorage.setItem(key.toString(), JSON.stringify(data));
  }
}
