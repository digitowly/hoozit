import { Coordinate } from '../../../model/coordinate';

export interface GbifOccurrenceResponse {
  results: GbifOccurrence[];
}

export interface GbifOccurrence {
  key: number;
  taxonKey: number;
  decimalLatitude: number;
  decimalLongitude: number;
  country: string;
  scientificName: string;
  locality: string;
  eventDate: string;
  institutionCode: string;
}

export interface GbifOccurrenceResponseCache {
  coordinate: Coordinate;
  response: GbifOccurrenceResponse;
}
