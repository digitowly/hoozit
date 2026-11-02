import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';

type LocationError = 'denied' | 'unavailable' | 'timeout' | 'unsupported';

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
    this.error.set(null);
    if (!navigator.geolocation) {
      this.error.set('unsupported');
      return;
    }
    this.isLoading.set(true);
    const requestId = ++this.requestId;
    this.watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (requestId !== this.requestId) return;
        this.coordinate.set({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        this.error.set(null);
        this.isLoading.set(false);
      },
      (error) => {
        if (requestId !== this.requestId) return;
        this.coordinate.set(null);
        this.error.set(
          error.code === 1
            ? 'denied'
            : error.code === 3
              ? 'timeout'
              : 'unavailable',
        );
        this.isLoading.set(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 },
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
