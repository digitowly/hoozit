import { Coordinate } from '../../model/coordinate';

export interface Marker {
  coordinate: Coordinate;
  icon: string;
  content: string;
}

export abstract class MapService {
  abstract init(coordinate: Coordinate, zoom: number): void;

  abstract createMarker(marker: Marker): void;
  abstract removeMarkers(): void;

  abstract drawCircle(coordinate: Coordinate): void;
}
