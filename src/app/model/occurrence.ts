export interface Occurrence {
  id: number;
  name: string;
  thumbnail: string;
}

export interface OccurrenceResponse {
  data: Occurrence[];
}
