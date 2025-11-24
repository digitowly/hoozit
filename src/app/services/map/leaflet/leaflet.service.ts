import { Injectable, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';
import { MapService, Marker } from '../map-service';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class LeafletService extends MapService {
  private map: L.Map | null = null;
  override selectedMarker = signal<Marker | null>(null);

  override init(coordinate: Coordinate, zoom: number = 13) {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      center: [coordinate.latitude, coordinate.longitude],
      zoom,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  override setCenter(coordinate: Coordinate) {
    if (!this.map) return;
    this.map.setView(
      [coordinate.latitude, coordinate.longitude],
      this.map.getZoom(),
    );
  }

  override createMarker(marker: Marker): void {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    L.marker([marker.coordinate.latitude, marker.coordinate.longitude])
      .addTo(this.map)
      .setIcon(
        L.icon({
          className: 'marker-icon',
          iconUrl: marker.icon,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      )
      .on('click', () => this.onMarkerClick(marker))
      .bindPopup(marker.content);
  }

  override onMarkerClick(marker: Marker) {
    this.selectedMarker.set(marker);
  }

  override removeMarkers() {
    if (!this.map) return;
    this.map.eachLayer((layer) => {
      if ((layer as L.Marker).getLatLng) {
        this.map?.removeLayer(layer);
      }
    });
  }

  override repaintUserMarker(coordinate: Coordinate) {
    if (!this.map) return;
    // Remove existing marker if it exists
    this.map.eachLayer((layer) => {
      if (
        layer instanceof L.Circle &&
        layer.options.className === 'user-location-marker'
      ) {
        layer.remove();
      }
    });

    // Add new marker at the new location
    L.circle([coordinate.latitude, coordinate.longitude], {
      className: 'user-location-marker',
      color: 'blue',
      fillColor: '#blue',
      fillOpacity: 0.1,
      radius: 20,
    }).addTo(this.map);
  }
}
