import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';

type LocationError = 'denied' | 'unavailable' | 'timeout' | 'unsupported';

const WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60000,
};

// Resolves immediately with the browser's cached fix, if any.
const CACHED_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: Infinity,
  timeout: 0,
};

@Injectable({ providedIn: 'root' })
export class UserLocationService implements OnDestroy {
  readonly coordinate = signal<Coordinate | null>(null);
  readonly error = signal<LocationError | null>(null);
  readonly isLoading = signal(false);
  readonly hasError = computed(() => this.error() !== null);
  readonly isValid = computed(
    () => this.coordinate() !== null && !this.hasError(),
  );
  readonly hasResolved = computed(() => this.isValid() || this.hasError());
  private watchId: number | null = null;
  private requestId = 0;

  getLocation() {
    if (this.watchId !== null) return;
    if (!navigator.geolocation) {
      this.error.set('unsupported');
      return;
    }
    this.isLoading.set(true);
    const requestId = ++this.requestId;
    const onPosition = ({ coords }: GeolocationPosition) => {
      if (requestId !== this.requestId) return;
      this.coordinate.set({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      this.error.set(null);
      this.isLoading.set(false);
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Never let a stale cached fix override a live one.
        if (this.coordinate() === null) onPosition(position);
      },
      () => {
        // No cached fix: the watcher below reports real failures.
      },
      CACHED_OPTIONS,
    );

    // Transient errors (unavailable/timeout) do not end a watch: the browser
    // keeps trying and delivers a fix once the OS has one. Restarting the
    // watcher here would discard that progress, so only report the state.
    this.watchId = navigator.geolocation.watchPosition(
      onPosition,
      (error) => {
        if (requestId !== this.requestId) return;
        // A provider outage does not invalidate the last known map position.
        // Permission denial does: do not continue using it after access is revoked.
        if (error.code === 1) this.coordinate.set(null);
        this.error.set(
          error.code === 1
            ? 'denied'
            : error.code === 3
              ? 'timeout'
              : 'unavailable',
        );
        this.isLoading.set(false);
      },
      WATCH_OPTIONS,
    );
  }

  retry() {
    this.stopWatching();
    this.getLocation();
  }

  ngOnDestroy() {
    this.stopWatching();
  }

  private stopWatching() {
    ++this.requestId;
    if (this.watchId !== null) navigator.geolocation?.clearWatch(this.watchId);
    this.watchId = null;
  }
}
