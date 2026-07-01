import { Injectable, signal } from '@angular/core';
import { Coordinate } from '../../../model/coordinate';
import { MapService, MapMarker, MapCamera } from '../map-service';
import * as L from 'leaflet';

const MIN_ZOOM = 8;

@Injectable({ providedIn: 'root' })
export class LeafletService extends MapService {
  private map: L.Map | null = null;
  private settleCallbacks: (() => void)[] = [];
  private isZooming = false;
  override selectedMarker = signal<MapMarker | null>(null);
  override readonly camera = signal<MapCamera | null>(null);

  override init(coordinate: Coordinate, zoom: number = 13) {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map', {
      center: [coordinate.latitude, coordinate.longitude],
      zoom,
      minZoom: MIN_ZOOM,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('zoomstart', () => {
      this.isZooming = true;
      this.publishCamera();
    });
    this.map.on('move zoom resize', () => this.publishCamera());
    this.map.on('moveend zoomend', () => {
      this.isZooming = false;
      this.publishCamera();
      this.settleCallbacks.forEach((callback) => callback());
    });
    this.publishCamera();
  }

  override projectToContainer(coordinate: Coordinate) {
    if (!this.map) return null;
    const point = this.map.latLngToContainerPoint([
      coordinate.latitude,
      coordinate.longitude,
    ]);
    return { x: point.x, y: point.y };
  }

  override metersToPixels(meters: number): number {
    if (!this.map) return 0;
    const latitude = this.map.getCenter().lat;
    const metersPerPixel =
      (40075016.686 * Math.cos((latitude * Math.PI) / 180)) /
      Math.pow(2, this.map.getZoom() + 8);
    return meters / metersPerPixel;
  }

  override onCameraSettle(callback: () => void): void {
    this.settleCallbacks.push(callback);
  }

  private publishCamera() {
    if (!this.map) return;
    const center = this.map.getCenter();
    const size = this.map.getSize();
    this.camera.set({
      center: { latitude: center.lat, longitude: center.lng },
      zoom: this.map.getZoom(),
      width: size.x,
      height: size.y,
      isZooming: this.isZooming,
    });
  }

  override setCenter(coordinate: Coordinate) {
    if (!this.map) return;
    this.map.setView(
      [coordinate.latitude, coordinate.longitude],
      this.map.getZoom(),
    );
  }

  override createMarker(
    marker: MapMarker,
    onTap: (marker: MapMarker) => void,
  ): void {
    if (!this.map) {
      console.error('Map not initialized');
      return;
    }

    const leafletMarker = L.marker(
      [marker.coordinate.latitude, marker.coordinate.longitude],
      { icon: this.createMarkerIcon(marker.icon) },
    ).addTo(this.map);

    leafletMarker.on('click', () => {
      this.onMarkerClick(marker);
      onTap(marker);
    });
  }

  private createMarkerIcon(iconUrl: string): L.Icon | L.DivIcon {
    if (!iconUrl) {
      return L.divIcon({
        className: 'default-marker-icon',
        iconSize: [26, 26],
        iconAnchor: [13, 26],
        popupAnchor: [0, -26],
      });
    }

    return L.icon({
      className: 'marker-icon',
      iconUrl,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }

  override onMarkerClick(marker: MapMarker) {
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

  override registerLongPress(callback: (coordinate: Coordinate) => void): void {
    if (!this.map) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const cancel = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const start = (e: L.LeafletEvent) => {
      cancel();
      const { latlng } = e as L.LeafletMouseEvent;
      timer = setTimeout(() => {
        callback({ latitude: latlng.lat, longitude: latlng.lng });
      }, 500);
    };

    this.map.on('mousedown', start);
    this.map.on('touchstart', start);
    this.map.on('mouseup mousemove touchend touchmove', cancel);
  }

  override repaintUserMarker(coordinate: Coordinate) {
    if (!this.map) return;
    this.map.eachLayer((layer) => {
      if (
        layer instanceof L.Circle &&
        layer.options.className === 'user-location-marker'
      ) {
        layer.remove();
      }
    });

    L.circle([coordinate.latitude, coordinate.longitude], {
      className: 'user-location-marker',
      color: 'blue',
      fillColor: '#blue',
      fillOpacity: 0.1,
      radius: 20,
    }).addTo(this.map);
  }
}
