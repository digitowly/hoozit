import { Coordinate } from '../../model/coordinate';
import { WritableSignal } from '@angular/core';

export interface MapMarker {
  coordinate: Coordinate;
  icon: string;
  content: {
    title: string;
    scientificName: string;
    loyalty: string;
    date: string;
    institutionCode: string;
  };
}

export abstract class MapService {
  abstract selectedMarker: WritableSignal<MapMarker | null>;

  abstract init(coordinate: Coordinate, zoom: number): void;
  abstract setCenter(coordinate: Coordinate): void;

  abstract createMarker(
    marker: MapMarker,
    onTap: (marker: MapMarker) => void,
  ): void;
  abstract onMarkerClick(marker: MapMarker): void;
  abstract removeMarkers(): void;

  abstract repaintUserMarker(coordinate: Coordinate): void;
}
