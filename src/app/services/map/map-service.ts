import { Coordinate } from '../../model/coordinate';
import { Signal, WritableSignal } from '@angular/core';

export interface MapMarker {
  coordinate: Coordinate;
  icon: string;
  content: {
    title: string;
    scientificName?: string;
    source?: string;
    author?: string;
    date?: string;
  };
}

export interface MapCamera {
  center: Coordinate;
  zoom: number;
  width: number;
  height: number;
}

export abstract class MapService {
  abstract selectedMarker: WritableSignal<MapMarker | null>;

  abstract readonly camera: Signal<MapCamera | null>;

  abstract init(coordinate: Coordinate, zoom: number): void;
  abstract setCenter(coordinate: Coordinate): void;

  abstract projectToContainer(
    coordinate: Coordinate,
  ): { x: number; y: number } | null;

  abstract metersToPixels(meters: number): number;

  abstract onCameraSettle(callback: () => void): void;

  abstract createMarker(
    marker: MapMarker,
    onTap: (marker: MapMarker) => void,
  ): void;
  abstract onMarkerClick(marker: MapMarker): void;
  abstract removeMarkers(): void;

  abstract repaintUserMarker(coordinate: Coordinate): void;

  abstract registerLongPress(callback: (coordinate: Coordinate) => void): void;
}
