import { computed, Injectable, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';

@Injectable({
  providedIn: 'root',
})
export class UserLocationService {
  coordinate = signal<Coordinate>({ latitude: 50, longitude: 50 });
  private isInitialized = signal<boolean>(false);
  private hasError = signal<boolean>(true);
  isValid = computed(() => this.isInitialized() && !this.hasError());

  getLocation() {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.coordinate.set({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.hasError.set(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        this.hasError.set(true);
      },
    );

    this.isInitialized.set(true);
  }
}
