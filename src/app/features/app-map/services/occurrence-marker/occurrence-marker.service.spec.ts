import { beforeEach, describe, it, expect, vi } from 'vitest';
import { OccurrenceMarkerService } from './occurrence-marker.service';
import { TestBed } from '@angular/core/testing';
import { GbifOccurrenceService } from '../../../../services/gbif/gbif-occurrence/gbif-occurrence.service';
import {
  SearchResultSelection,
  SearchResultSelectionService,
} from '../../../search/services/search-result-selection/search-result-selection.service';
import { MapMarker, MapService } from '../../../../services/map/map-service';
import { signal } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { GbifOccurrenceResponse } from '../../../../services/gbif/gbif-occurrence/gbif-occurrence.model';
import { Coordinate } from '../../../../model/coordinate';

describe('OccurrenceMarkerService', () => {
  let service: OccurrenceMarkerService;
  let mockMapService: MapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: GbifOccurrenceService,
          useValue: {
            search: () => of<GbifOccurrenceResponse>(mockOccurrenceResponse),
          },
        },
        {
          provide: SearchResultSelectionService,
          useValue: {
            selections: signal<SearchResultSelection[]>([
              {
                gbif_key: '123',
                id: 123,
                binomial_name: 'Binomial Name',
                name: 'Test Animal',
                thumbnail: '',
              },
            ]),
            selected: [],
            hasIdenticalSelections: () => false,
          },
        },
        {
          provide: MapService,
          useValue: { removeMarkers: () => {} },
        },
      ],
    });

    service = TestBed.inject(OccurrenceMarkerService);
    mockMapService = TestBed.inject(MapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create markers', async () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };
    const markers: MapMarker[] = [];

    await firstValueFrom(
      service.createMarkers(mockMapService, location, (marker) => {
        markers.push(marker);
      }),
    );

    expect(markers.length).toBeGreaterThan(0);

    const firstMarker = markers[0];
    expect(firstMarker).toBeDefined();
    expect(firstMarker).toBeDefined();
    expect(firstMarker.coordinate.latitude).toEqual(40.7128);
    expect(firstMarker.coordinate.longitude).toEqual(-74.006);
  });
});

const mockOccurrenceResponse: GbifOccurrenceResponse = {
  results: [
    {
      scientificName: 'Test Species',
      key: 123,
      decimalLatitude: 40.7128,
      decimalLongitude: -74.006,
      taxonKey: 12345,
      country: 'United States',
      eventDate: '2023-09-15',
      institutionCode: 'Test Institution',
      locality: 'Test City',
    },
  ],
};
