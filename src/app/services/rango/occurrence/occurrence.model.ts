export interface UserOccurrenceRequest {
  name: string;
  description: string;
  coordinates: { latitude: number; longitude: number };
  confidence: number;
}
