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
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryDelay = 5000;

  getLocation() {
    if (this.watchId !== null) return;
    if (!navigator.geolocation) {
      this.error.set('unsupported');
      return;
    }
    this.isLoading.set(true);
    const requestId = ++this.requestId;
    this.watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        if (requestId !== this.requestId) return;
        this.clearRetry();
        this.retryDelay = 5000;
        this.coordinate.set({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        this.error.set(null);
        this.isLoading.set(false);
      },
      (error) => {
        if (requestId !== this.requestId) return;
        // A provider outage does not invalidate the last known map position.
        // Permission denial does: do not continue using it after access is revoked.
        if (error.code === 1) {
          this.coordinate.set(null);
          this.clearRetry();
        } else {
          this.scheduleRetry();
        }
        this.error.set(
          error.code === 1
            ? 'denied'
            : error.code === 3
              ? 'timeout'
              : 'unavailable',
        );
        this.isLoading.set(false);
      },
      { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 },
    );
  }

  retry() {
    this.clearRetry();
    this.stopWatching();
    this.getLocation();
  }

  ngOnDestroy() {
    this.clearRetry();
    this.stopWatching();
  }

  private scheduleRetry() {
    if (this.retryTimer !== null) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.retry();
    }, this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 2, 60000);
  }

  private clearRetry() {
    if (this.retryTimer !== null) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  private stopWatching() {
    ++this.requestId;
    if (this.watchId !== null) navigator.geolocation?.clearWatch(this.watchId);
    this.watchId = null;
  }
}
