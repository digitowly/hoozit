export interface UserOccurrenceRequest {
  name: string;
  description: string;
  confidence: number;
  coordinates: { latitude: number; longitude: number };
  date: string;
  time_start: string;
  time_end: string;
  quantity_estimate?: string;
  sex?: string;
  life_stage?: string;
  behavior?: string;
  is_captive?: boolean;
}
