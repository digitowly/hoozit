export interface Occurrence {
  id: number;
  name: string;
  binomial_name: string;
  thumbnail: string;
}

export interface OccurrenceResponse {
  data: Occurrence[];
}
