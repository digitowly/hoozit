export interface AnimalSearchResult {
  id: number;
  name: string;
  binomial_name: string;
  thumbnail: string;
  taxonKey: string;
}

export interface AnimalSearchResponse {
  data: AnimalSearchResult[];
}

export interface AnimalSearchApiResponse {
  data: Array<Omit<AnimalSearchResult, 'taxonKey'> & { gbif_key: string }>;
}
