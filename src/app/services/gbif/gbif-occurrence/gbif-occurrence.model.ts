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
