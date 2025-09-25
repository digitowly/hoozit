import { Injectable, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';

@Injectable({
  providedIn: 'root',
})
export class UserLocationService {
  coordinate = signal<Coordinate>({ latitude: 0, longitude: 0 });

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
      },
      (error) => {
        console.error('Error getting location:', error);
      }
    );
  }
}
