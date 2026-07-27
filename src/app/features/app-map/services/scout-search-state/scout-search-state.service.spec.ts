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
  let userCoordinate: ReturnType<typeof signal<Coordinate>>;
  let userIsValid: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    camera = signal<MapCamera | null>({
      center: { latitude: 56, longitude: 13 },
      zoom: 13,
      width: 500,
      height: 500,
    });
    activeRadiusLevel = signal<OccurrenceSearchRadiusLevel>(3);
    userCoordinate = signal<Coordinate>({ latitude: 56, longitude: 13 });
    userIsValid = signal(true);

    TestBed.configureTestingModule({
      providers: [
        ScoutSearchStateService,
        ScoutLensService,
        {
          provide: UserLocationService,
          useValue: {
            coordinate: userCoordinate,
            isValid: userIsValid,
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

    service.increaseRadius();
    service.increaseRadius();

    expect(service.activeLens().radius).toBe(100);
    expect(service.ghostLens()?.radius).toBe(500);

    service.beginSearch({ latitude: 56, longitude: 13 }, 'ghost');
    activeRadiusLevel.set(5);

    expect(service.activeLens().radius).toBe(100);
    expect(service.ghostLens()?.radius).toBe(500);

    service.completeSearch({ latitude: 56, longitude: 13 });

    expect(service.activeLens().radius).toBe(500);
  });

  it('keeps the requested radius independent of map zoom', () => {
    expect(service.requestedRadiusLevel()).toBe(3);

    camera.set({
      center: { latitude: 56, longitude: 13 },
      zoom: 11,
      width: 500,
      height: 500,
    });

    expect(service.requestedRadiusLevel()).toBe(3);

    service.increaseRadius();

    expect(service.requestedRadiusLevel()).toBe(4);

    camera.set({
      center: { latitude: 56, longitude: 13 },
      zoom: 18,
      width: 500,
      height: 500,
    });

    expect(service.requestedRadiusLevel()).toBe(4);
  });

  it('shows a ghost lens when the requested radius changes from the completed search radius', () => {
    service.completeSearch({ latitude: 56, longitude: 13 });

    expect(service.ghostLens()).toBeNull();

    service.increaseRadius();

    expect(service.ghostLens()?.radius).toBe(200);
  });

  it('snaps the ghost search coordinate to the user when the lens is anchored', () => {
    const manualCoordinate = { latitude: 57, longitude: 14 };
    const mapCenter = { latitude: 58, longitude: 15 };
    service.completeSearch(manualCoordinate);
    camera.set({
      center: mapCenter,
      zoom: 13,
      width: 500,
      height: 500,
    });

    expect(service.searchHereCoordinate()).toEqual(userCoordinate());
  });

  it('keeps the ghost search coordinate at the map center while scouting away from the anchor', () => {
    const scoutLens = TestBed.inject(ScoutLensService);
    const mapCenter = { latitude: 58, longitude: 15 };
    service.completeSearch({ latitude: 57, longitude: 14 });
    camera.set({
      center: mapCenter,
      zoom: 13,
      width: 500,
      height: 500,
    });
    scoutLens.phase.set('scouting');

    expect(service.searchHereCoordinate()).toEqual(mapCenter);
  });

  it('keeps radius controls within the supported search levels', () => {
    service.decreaseRadius();
    service.decreaseRadius();
    service.decreaseRadius();

    expect(service.requestedRadiusLevel()).toBe(1);
    expect(service.canDecreaseRadius()).toBe(false);
    expect(service.canIncreaseRadius()).toBe(true);

    service.increaseRadius();
    service.increaseRadius();
    service.increaseRadius();
    service.increaseRadius();
    service.increaseRadius();

    expect(service.requestedRadiusLevel()).toBe(5);
    expect(service.canDecreaseRadius()).toBe(true);
    expect(service.canIncreaseRadius()).toBe(false);
  });
});
