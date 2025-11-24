import { beforeEach, describe, expect, it } from 'vitest';
import { GeoService } from './geo.service';
import { Coordinate } from '../../model/coordinate';

describe('GeoService', () => {
  let geoService: GeoService;

  beforeEach(() => {
    geoService = new GeoService();
  });

  it('should return the distance between two coordinates', () => {
    const coord1: Coordinate = { latitude: 52.520008, longitude: 13.404954 };
    const coord2: Coordinate = { latitude: 52.517037, longitude: 13.448258 };

    const result = geoService.getDistance(coord1, coord2);

    expect(result).toEqual(2.94862877544885);
  });
});
