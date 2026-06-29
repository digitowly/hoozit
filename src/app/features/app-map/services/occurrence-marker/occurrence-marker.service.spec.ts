import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { firstValueFrom, of } from 'rxjs';
import { Coordinate } from '../../../../model/coordinate';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { MapMarker, MapService } from '../../../../services/map/map-service';
import {
  OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  OccurrenceSearchResponse,
} from '../../../../services/occurrence/occurrence-search/occurrence-search.model';
import { OccurrenceSearchService } from '../../../../services/occurrence/occurrence-search/occurrence-search.service';
import {
  SearchResultSelection,
  SearchResultSelectionService,
} from '../../../search/services/search-result-selection/search-result-selection.service';
import { OccurrenceMarkerService } from './occurrence-marker.service';

describe('OccurrenceMarkerService', () => {
  let service: OccurrenceMarkerService;
  let search: ReturnType<typeof vi.fn>;
  let hasIdenticalSelections: ReturnType<typeof vi.fn>;
  let mockMapService: MapService;

  beforeEach(() => {
    search = vi.fn(() => of(mockOccurrenceResponse));
    hasIdenticalSelections = vi.fn(() => false);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: OccurrenceSearchService,
          useValue: { search },
        },
        {
          provide: SearchResultSelectionService,
          useValue: {
            selections: signal<SearchResultSelection[]>(mockSelections),
            hasIdenticalSelections,
          },
        },
        {
          provide: MapService,
          useValue: {
            removeMarkers: vi.fn(),
            repaintUserMarker: vi.fn(),
          },
        },
      ],
    });

    service = TestBed.inject(OccurrenceMarkerService);
    mockMapService = TestBed.inject(MapService);
  });

  it('searches Scout once with every selected taxon key', async () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };
    const markers: MapMarker[] = [];

    await firstValueFrom(
      service.createMarkers(
        mockMapService,
        location,
        (marker) => markers.push(marker),
        { radiusLevel: 5 },
      ),
    );

    expect(search).toHaveBeenCalledWith(location, ['123', '456'], 5);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toMatchObject({
      coordinate: { latitude: 40.7128, longitude: -74.006 },
      content: {
        title: 'Test species',
        scientificName: 'Testus species',
        source: 'scout',
        author: 'Test observer',
        date: '2026-06-20T10:00:00Z',
      },
    });
  });

  it('marks the load as failed when Scout is unavailable', async () => {
    search.mockReturnValue(of(null));

    await firstValueFrom(
      service.createMarkers(
        mockMapService,
        { latitude: 42.7128, longitude: -64.006 },
        vi.fn(),
        { radiusLevel: OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL },
      ),
      { defaultValue: undefined },
    );

    expect(service.lastLoadFailed()).toBe(true);
  });

  it('keeps a larger fetched radius when zooming in at the same location', async () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };

    await firstValueFrom(
      service.createMarkers(mockMapService, location, vi.fn(), {
        radiusLevel: 5,
      }),
    );

    hasIdenticalSelections.mockReturnValue(true);

    await firstValueFrom(
      service.createMarkers(mockMapService, location, vi.fn(), {
        radiusLevel: 3,
      }),
      { defaultValue: undefined },
    );

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith(location, ['123', '456'], 5);
    expect(service.activeRadiusLevel()).toBe(5);
  });
});

const mockSelections: AnimalSearchResult[] = [
  {
    id: 123,
    binomial_name: 'Binomial Name',
    name: 'Test Animal',
    taxonKey: '123',
    thumbnail: '',
  },
  {
    id: 456,
    binomial_name: 'Second Name',
    name: 'Second Animal',
    taxonKey: '456',
    thumbnail: '',
  },
];

const mockOccurrenceResponse: OccurrenceSearchResponse = {
  total: 1,
  results: [
    {
      id: '123',
      source: 'scout',
      name: {
        display: 'Test species',
        scientific: 'Testus species',
      },
      observed_at: '2026-06-20T10:00:00Z',
      location: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      status: 'verified',
      author: {
        nickname: 'Test observer',
      },
    },
  ],
};
