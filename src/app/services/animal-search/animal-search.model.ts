export interface AnimalSearchResult {
  id: number;
  name: string;
  binomial_name: string;
  thumbnail: string;
  gbif_key: string;
}

export interface AnimalSearchResponse {
  data: AnimalSearchResult[];
}
