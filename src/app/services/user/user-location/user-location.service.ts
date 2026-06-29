import { computed, Injectable, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';

@Injectable({
  providedIn: 'root',
})
export class UserLocationService {
  coordinate = signal<Coordinate>({ latitude: 50, longitude: 50 });
  private isInitialized = signal<boolean>(false);
  hasError = signal<boolean>(true);
  isValid = computed(() => this.isInitialized() && !this.hasError());
  hasResolved = computed(() => this.isInitialized());

  private watchId: number | null = null;

  getLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    // Prevent starting multiple watchers
    if (this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.coordinate.set({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.hasError.set(false);
        this.isInitialized.set(true);
      },
      (error) => {
        console.error('Error getting location:', error);
        this.hasError.set(true);
        this.isInitialized.set(true);
      },
    );
  }
}
