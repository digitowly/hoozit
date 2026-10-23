import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import * as L from 'leaflet';

import { Coordinate } from '../../../../model/coordinate';

const LOCATION_ZOOM = 14;

@Component({
  selector: 'occurrence-location-map',
  templateUrl: './occurrence-location-map.component.html',
  styleUrl: './occurrence-location-map.component.scss',
})
export class OccurrenceLocationMapComponent
  implements AfterViewInit, OnDestroy
{
  readonly coordinate = input.required<Coordinate>();

  protected readonly mapLabel = computed(() => {
    const { latitude, longitude } = this.coordinate();
    return `Occurrence location at ${latitude}, ${longitude}`;
  });

  private readonly mapElement =
    viewChild.required<ElementRef<HTMLElement>>('mapElement');
  private readonly map = signal<L.Map | null>(null);
  private marker: L.CircleMarker | null = null;

  constructor() {
    effect(() => {
      const map = this.map();
      const coordinate = this.coordinate();
      if (!map) return;

      const location: L.LatLngExpression = [
        coordinate.latitude,
        coordinate.longitude,
      ];
      map.setView(location, LOCATION_ZOOM);

      if (this.marker) {
        this.marker.setLatLng(location);
      } else {
        this.marker = L.circleMarker(location, {
          className: 'occurrence-location-marker',
          color: '#f7fcf9',
          fillColor: '#127c7e',
          fillOpacity: 1,
          opacity: 1,
          radius: 9,
          weight: 3,
        }).addTo(map);
      }
    });
  }

  ngAfterViewInit(): void {
    const coordinate = this.coordinate();
    const map = L.map(this.mapElement().nativeElement, {
      center: [coordinate.latitude, coordinate.longitude],
      zoom: LOCATION_ZOOM,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    this.map.set(map);
  }

  ngOnDestroy(): void {
    this.map()?.remove();
    this.map.set(null);
  }
}
