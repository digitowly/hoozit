import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapViewComponent } from './map-view.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideZonelessChangeDetection,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { localStorageMock } from '../../../mock/localStorage';

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('MapViewComponent', () => {
  let component: MapViewComponent;
  let fixture: ComponentFixture<MapViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapViewComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    })
      .overrideComponent(MapViewComponent, {
        set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();
    vi.spyOn(
      TestBed.inject(UserLocationService),
      'getLocation',
    ).mockImplementation(() => {});

    fixture = TestBed.createComponent(MapViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('only mounts the map after a real fix and preserves it through transient errors', () => {
    const location = TestBed.inject(UserLocationService);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-map')).toBeNull();
    location.coordinate.set({ latitude: 52, longitude: 13 });
    fixture.detectChanges();
    const map = element.querySelector('app-map');
    expect(map).not.toBeNull();
    location.error.set('timeout');
    fixture.detectChanges();
    expect(element.querySelector('app-map')).toBe(map);
    expect(element.textContent).toContain('last known position');
    location.error.set(null);
    fixture.detectChanges();
    expect(element.querySelector('app-map')).toBe(map);
    expect(element.querySelector('.location-notice')).toBeNull();
    location.coordinate.set(null);
    location.error.set('denied');
    fixture.detectChanges();
    expect(element.querySelector('app-map')).toBeNull();
    expect(element.textContent).toContain('browser settings');
  });

  it('explains a timeout separately from permission denial and offers retry', () => {
    const location = TestBed.inject(UserLocationService);
    const retry = vi.spyOn(location, 'retry').mockImplementation(() => {});
    location.error.set('timeout');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('retry automatically');
    fixture.nativeElement.querySelector('button').click();
    expect(retry).toHaveBeenCalledOnce();
  });

  it('shows the map at a remembered position while waiting for a live fix', () => {
    const location = TestBed.inject(UserLocationService);
    location.coordinate.set({ latitude: 48, longitude: 11 });
    location.isStale.set(true);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-map')).not.toBeNull();
    expect(element.textContent).toContain('last known position');
    location.isStale.set(false);
    fixture.detectChanges();
    expect(element.querySelector('.location-notice')).toBeNull();
  });
});
