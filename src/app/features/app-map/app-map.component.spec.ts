import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { AppMapComponent } from './app-map.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { localStorageMock } from '../../../mock/localStorage';
import { OccurrenceMarkerService } from './services/occurrence-marker/occurrence-marker.service';
import { ScoutSearchStateService } from './services/scout-search-state/scout-search-state.service';

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('MapComponent', () => {
  let component: AppMapComponent;
  let fixture: ComponentFixture<AppMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppMapComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    TestBed.inject(UserLocationService).coordinate.set({
      latitude: 56,
      longitude: 13,
    });
    fixture = TestBed.createComponent(AppMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ignore stale marker search completions', () => {
    const markerService = fixture.debugElement.injector.get(
      OccurrenceMarkerService,
    );
    const scoutSearch = fixture.debugElement.injector.get(
      ScoutSearchStateService,
    );
    const completions: Array<() => void> = [];
    const firstCoordinate = { latitude: 56, longitude: 13 };
    const secondCoordinate = { latitude: 57, longitude: 14 };
    vi.spyOn(scoutSearch, 'isZoomedOut').mockReturnValue(false);
    const completeSearch = vi.spyOn(scoutSearch, 'completeSearch');

    vi.spyOn(markerService, 'createMarkers').mockImplementation(
      (_mapService, _location, _onCreate, options) => {
        if (options?.onComplete) completions.push(options.onComplete);
        return 'loading';
      },
    );

    (component as any).loadOccurrences(true, firstCoordinate);
    (component as any).loadOccurrences(true, secondCoordinate);

    completions[0]();
    completions[1]();

    expect(completeSearch).toHaveBeenCalledOnce();
    expect(completeSearch).toHaveBeenCalledWith(secondCoordinate);
  });

  it('forces an occurrence marker reload after logging an occurrence', () => {
    const markerService = fixture.debugElement.injector.get(
      OccurrenceMarkerService,
    );
    const scoutSearch = fixture.debugElement.injector.get(
      ScoutSearchStateService,
    );
    const coordinate = { latitude: 56, longitude: 13 };
    const radiusLevel = scoutSearch.requestedRadiusLevel();

    vi.spyOn(scoutSearch, 'isZoomedOut').mockReturnValue(false);
    vi.spyOn(scoutSearch, 'retryCoordinate').mockReturnValue(coordinate);
    const createMarkers = vi
      .spyOn(markerService, 'createMarkers')
      .mockReturnValue('loading');

    component.refreshOccurrencesAfterLog();

    expect(createMarkers).toHaveBeenCalledWith(
      expect.anything(),
      coordinate,
      expect.any(Function),
      expect.objectContaining({ force: true, radiusLevel }),
    );
  });
  it('does not request occurrences without a valid location', () => {
    const markerService = fixture.debugElement.injector.get(
      OccurrenceMarkerService,
    );
    const createMarkers = vi.spyOn(markerService, 'createMarkers');
    TestBed.inject(UserLocationService).coordinate.set(null);
    (component as any).loadOccurrences(true, { latitude: 56, longitude: 13 });
    expect(createMarkers).not.toHaveBeenCalled();
  });

  it('marks the center button while the location may be inaccurate', () => {
    const location = TestBed.inject(UserLocationService);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('.approximate-dot')).toBeNull();
    location.isStale.set(true);
    fixture.detectChanges();
    expect(
      element.querySelector('.approximate-dot')?.getAttribute('aria-label'),
    ).toBe('Your location may be inaccurate');
    location.isStale.set(false);
    location.error.set('unavailable');
    fixture.detectChanges();
    expect(element.querySelector('.approximate-dot')).not.toBeNull();
    location.error.set(null);
    fixture.detectChanges();
    expect(element.querySelector('.approximate-dot')).toBeNull();
  });
});
