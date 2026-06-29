import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserLocationService } from '../../../../services/user/user-location/user-location.service';
import { MapCamera, MapService } from '../../../../services/map/map-service';
import { OccurrenceMarkerService } from '../occurrence-marker/occurrence-marker.service';
import { ScoutLensService } from '../scout-lens/scout-lens.service';
import { ScoutSearchStateService } from './scout-search-state.service';
import { Coordinate } from '../../../../model/coordinate';
import { OccurrenceSearchRadiusLevel } from '../../../../services/occurrence/occurrence-search/occurrence-search.model';

describe('ScoutSearchStateService', () => {
  let service: ScoutSearchStateService;
  let camera: ReturnType<typeof signal<MapCamera | null>>;
  let activeRadiusLevel: ReturnType<typeof signal<OccurrenceSearchRadiusLevel>>;

  beforeEach(() => {
    camera = signal<MapCamera | null>({
      center: { latitude: 56, longitude: 13 },
      zoom: 13,
      width: 500,
      height: 500,
    });
    activeRadiusLevel = signal<OccurrenceSearchRadiusLevel>(3);

    TestBed.configureTestingModule({
      providers: [
        ScoutSearchStateService,
        ScoutLensService,
        {
          provide: UserLocationService,
          useValue: {
            coordinate: signal<Coordinate>({ latitude: 56, longitude: 13 }),
            isValid: signal(true),
            hasResolved: signal(true),
          },
        },
        {
          provide: MapService,
          useValue: {
            camera,
            projectToContainer: vi.fn(() => ({ x: 250, y: 250 })),
            metersToPixels: vi.fn((meters: number) => meters / 10),
          },
        },
        {
          provide: OccurrenceMarkerService,
          useValue: {
            activeRadiusLevel,
            lastLoadFailed: signal(false),
          },
        },
      ],
    });

    service = TestBed.inject(ScoutSearchStateService);
  });

  it('keeps the completed lens radius separate from the ghost lens radius', () => {
    service.completeSearch({ latitude: 56, longitude: 13 });

    camera.set({
      center: { latitude: 56, longitude: 13 },
      zoom: 11,
      width: 500,
      height: 500,
    });

    expect(service.activeLens().radius).toBe(100);
    expect(service.ghostLens()?.radius).toBe(500);

    service.beginSearch({ latitude: 56, longitude: 13 }, 'ghost');
    activeRadiusLevel.set(5);

    expect(service.activeLens().radius).toBe(100);
    expect(service.ghostLens()?.radius).toBe(500);

    service.completeSearch({ latitude: 56, longitude: 13 });

    expect(service.activeLens().radius).toBe(500);
  });
});
