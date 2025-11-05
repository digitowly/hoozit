import { Coordinate } from '../../model/coordinate';
import { WritableSignal } from '@angular/core';

export interface Marker {
  coordinate: Coordinate;
  icon: string;
  content: string;
}

export abstract class MapService {
  abstract selectedMarker: WritableSignal<Marker | null>;

  abstract init(coordinate: Coordinate, zoom: number): void;

  abstract createMarker(marker: Marker): void;
  abstract onMarkerClick(marker: Marker): void;
  abstract removeMarkers(): void;

  abstract drawCircle(coordinate: Coordinate): void;
}
