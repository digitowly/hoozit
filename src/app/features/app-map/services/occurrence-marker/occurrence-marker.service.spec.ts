import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
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

let searchResponse: WritableSignal<OccurrenceSearchResponse | null>;
let searchLoading: WritableSignal<boolean>;

describe('OccurrenceMarkerService', () => {
  let service: OccurrenceMarkerService;
  let search: ReturnType<typeof vi.fn>;
  let hasIdenticalSelections: ReturnType<typeof vi.fn>;
  let mockMapService: MapService;

  beforeEach(() => {
    search = vi.fn();
    searchResponse = signal<OccurrenceSearchResponse | null>(null);
    searchLoading = signal(false);
    hasIdenticalSelections = vi.fn(() => false);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: OccurrenceSearchService,
          useValue: {
            search,
            resource: {
              value: searchResponse,
              isLoading: searchLoading,
              reload: vi.fn(),
            },
          },
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

  it('searches Scout once with every selected taxon key', () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };
    const markers: MapMarker[] = [];

    service.createMarkers(
      mockMapService,
      location,
      (marker) => markers.push(marker),
      { radiusLevel: 5 },
    );
    resolveSearch(mockOccurrenceResponse);

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

  it('uses the matching selected thumbnail for multi-species markers', () => {
    const markers: MapMarker[] = [];

    service.createMarkers(
      mockMapService,
      { latitude: 42.7128, longitude: -64.006 },
      (marker) => markers.push(marker),
      { radiusLevel: 5 },
    );
    resolveSearch(
      responseWithOccurrence('Second Animal', {
        taxon_key: '456',
        name: {
          display: 'Second Animal',
          scientific: 'Second Name',
        },
      }),
    );

    expect(markers[0].icon).toBe('second-thumbnail.jpg');
  });

  it('marks the load as failed when Scout is unavailable', () => {
    service.createMarkers(
      mockMapService,
      { latitude: 42.7128, longitude: -64.006 },
      vi.fn(),
      { radiusLevel: OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL },
    );
    resolveSearch(null);

    expect(service.lastLoadFailed()).toBe(true);
  });

  it('keeps a larger fetched radius when the same search requests a smaller radius', () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };

    service.createMarkers(mockMapService, location, vi.fn(), {
      radiusLevel: 5,
    });
    resolveSearch(mockOccurrenceResponse);

    hasIdenticalSelections.mockReturnValue(true);

    service.createMarkers(mockMapService, location, vi.fn(), {
      radiusLevel: 3,
    });

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith(location, ['123', '456'], 5);
    expect(service.activeRadiusLevel()).toBe(5);
  });

  it('repaints the user marker when reusing occurrence markers', () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };
    const nextLocation: Coordinate = { latitude: 42.713, longitude: -64.006 };

    service.createMarkers(mockMapService, location, vi.fn(), {
      radiusLevel: 3,
    });
    resolveSearch(mockOccurrenceResponse);
    vi.mocked(mockMapService.repaintUserMarker).mockClear();
    hasIdenticalSelections.mockReturnValue(true);

    service.createMarkers(mockMapService, nextLocation, vi.fn(), {
      radiusLevel: 3,
    });

    expect(search).toHaveBeenCalledTimes(1);
    expect(mockMapService.removeMarkers).toHaveBeenCalledTimes(1);
    expect(mockMapService.repaintUserMarker).toHaveBeenCalledWith(nextLocation);
  });

  it('replaces cached markers when forcing a refetch for the same search', () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };
    const renderedMarkers: MapMarker[] = [];

    service.createMarkers(mockMapService, location, vi.fn(), {
      radiusLevel: 3,
    });
    resolveSearch(responseWithOccurrence('stale species'));

    service.createMarkers(mockMapService, location, vi.fn(), {
      force: true,
      radiusLevel: 3,
    });
    resolveSearch(responseWithOccurrence('fresh species'));

    hasIdenticalSelections.mockReturnValue(false);

    service.createMarkers(
      mockMapService,
      location,
      (marker) => renderedMarkers.push(marker),
      { radiusLevel: 3 },
    );

    expect(search).toHaveBeenCalledTimes(2);
    expect(renderedMarkers.map((marker) => marker.content.title)).toEqual([
      'fresh species',
    ]);
  });

  it('redraws markers when the active occurrence search resource reloads', () => {
    const location: Coordinate = { latitude: 42.7128, longitude: -64.006 };
    const renderedMarkers: MapMarker[] = [];

    service.createMarkers(
      mockMapService,
      location,
      (marker) => renderedMarkers.push(marker),
      { radiusLevel: 3 },
    );
    resolveSearch(responseWithOccurrence('stale species'));

    renderedMarkers.length = 0;
    vi.mocked(mockMapService.removeMarkers).mockClear();

    resolveSearch(responseWithOccurrence('fresh species'));

    expect(mockMapService.removeMarkers).toHaveBeenCalledOnce();
    expect(renderedMarkers.map((marker) => marker.content.title)).toEqual([
      'fresh species',
    ]);
  });

  it('updates the active radius only after Scout responds', () => {
    service.createMarkers(
      mockMapService,
      { latitude: 42.7128, longitude: -64.006 },
      vi.fn(),
      { radiusLevel: 5 },
    );

    expect(service.activeRadiusLevel()).toBe(
      OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
    );

    resolveSearch(mockOccurrenceResponse);

    expect(service.activeRadiusLevel()).toBe(5);
  });
});

function resolveSearch(response: OccurrenceSearchResponse | null) {
  searchLoading.set(true);
  TestBed.tick();
  searchResponse.set(response);
  searchLoading.set(false);
  TestBed.tick();
}

const mockSelections: AnimalSearchResult[] = [
  {
    id: 123,
    binomial_name: 'Binomial Name',
    name: 'Test Animal',
    taxonKey: '123',
    thumbnail: 'first-thumbnail.jpg',
  },
  {
    id: 456,
    binomial_name: 'Second Name',
    name: 'Second Animal',
    taxonKey: '456',
    thumbnail: 'second-thumbnail.jpg',
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

function responseWithOccurrence(
  displayName: string,
  overrides: Partial<OccurrenceSearchResponse['results'][number]> = {},
): OccurrenceSearchResponse {
  return {
    ...mockOccurrenceResponse,
    results: [
      {
        ...mockOccurrenceResponse.results[0],
        ...overrides,
        name: {
          ...mockOccurrenceResponse.results[0].name,
          ...overrides.name,
          display: displayName,
        },
      },
    ],
  };
}
