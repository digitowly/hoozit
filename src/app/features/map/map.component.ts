import { Component, effect, inject } from '@angular/core';
import * as L from 'leaflet';
import { UserLocationService } from '../../services/user/user-location/user-location.service';

@Component({
  selector: 'map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  private map: L.Map | null = null;

  constructor(private userLocation: UserLocationService) {
    effect(() => {
      this.userLocation.getLocation();
    });

    effect(() => {
      if (this.userLocation.coordinate()) {
        this.initMap();
      }
    });
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    this.map = L.map('map').setView(
      [
        this.userLocation.coordinate().latitude,
        this.userLocation.coordinate().longitude,
      ],
      17
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      this.map
    );
  }
}
