import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';
import {
  ClientStorageKey,
  ClientStorageService,
} from '../../client-storage/client-storage.service';

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

const POLL_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 60000,
  timeout: 20000,
};

const INITIAL_POLL_DELAY = 5000;
const MAX_POLL_DELAY = 60000;

@Injectable({ providedIn: 'root' })
export class UserLocationService implements OnDestroy {
  private readonly storage = inject(ClientStorageService);

  readonly coordinate = signal<Coordinate | null>(null);
  readonly error = signal<LocationError | null>(null);
  readonly isLoading = signal(false);
  /** True while `coordinate` is a remembered position, not a live fix. */
  readonly isStale = signal(false);
  readonly hasError = computed(() => this.error() !== null);
  readonly isValid = computed(
    () => this.coordinate() !== null && !this.hasError() && !this.isStale(),
  );
  readonly isShowingLastKnown = computed(
    () => this.coordinate() !== null && !this.isValid(),
  );
  readonly hasResolved = computed(() => this.isValid() || this.hasError());
  private watchId: number | null = null;
  private requestId = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private pollDelay = INITIAL_POLL_DELAY;

  getLocation() {
    if (this.watchId !== null) return;
    if (!navigator.geolocation) {
      this.error.set('unsupported');
      return;
    }
    this.restoreLastKnown();
    this.isLoading.set(true);
    const requestId = ++this.requestId;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Never let a stale cached fix override a live one.
        if (!this.isValid()) this.handlePosition(requestId, position);
      },
      () => {
        // No cached fix: the watcher below reports real failures.
      },
      CACHED_OPTIONS,
    );

    // Transient errors (unavailable/timeout) do not end a watch: the browser
    // keeps trying. Restarting the watcher would discard that progress, so
    // keep it running and additionally poll until a fix arrives.
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePosition(requestId, position),
      (error) => this.handleError(requestId, error),
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

  private handlePosition(requestId: number, { coords }: GeolocationPosition) {
    if (requestId !== this.requestId) return;
    this.clearPoll();
    this.pollDelay = INITIAL_POLL_DELAY;
    const coordinate = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
    this.coordinate.set(coordinate);
    this.storage.set(ClientStorageKey.LAST_LOCATION, coordinate);
    this.isStale.set(false);
    this.error.set(null);
    this.isLoading.set(false);
  }

  private handleError(requestId: number, error: GeolocationPositionError) {
    if (requestId !== this.requestId) return;
    if (error.code === 1) {
      // Do not keep using or remembering a position after access is revoked.
      this.coordinate.set(null);
      this.isStale.set(false);
      this.storage.remove(ClientStorageKey.LAST_LOCATION);
      this.clearPoll();
    } else {
      this.schedulePoll(requestId);
    }
    this.error.set(
      error.code === 1
        ? 'denied'
        : error.code === 3
          ? 'timeout'
          : 'unavailable',
    );
    this.isLoading.set(false);
  }

  private schedulePoll(requestId: number) {
    if (this.pollTimer !== null) return;
    this.pollTimer = setTimeout(() => {
      this.pollTimer = null;
      navigator.geolocation?.getCurrentPosition(
        (position) => this.handlePosition(requestId, position),
        (error) => this.handleError(requestId, error),
        POLL_OPTIONS,
      );
    }, this.pollDelay);
    this.pollDelay = Math.min(this.pollDelay * 2, MAX_POLL_DELAY);
  }

  private restoreLastKnown() {
    if (this.coordinate() !== null) return;
    const stored = this.storage.get<Coordinate>(ClientStorageKey.LAST_LOCATION);
    if (
      typeof stored?.latitude !== 'number' ||
      typeof stored?.longitude !== 'number'
    ) {
      return;
    }
    this.coordinate.set({
      latitude: stored.latitude,
      longitude: stored.longitude,
    });
    this.isStale.set(true);
  }

  private clearPoll() {
    if (this.pollTimer !== null) clearTimeout(this.pollTimer);
    this.pollTimer = null;
  }

  private stopWatching() {
    ++this.requestId;
    this.clearPoll();
    this.pollDelay = INITIAL_POLL_DELAY;
    if (this.watchId !== null) navigator.geolocation?.clearWatch(this.watchId);
    this.watchId = null;
  }
}
