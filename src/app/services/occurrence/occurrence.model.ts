export interface UserOccurrenceRequest {
  name: string;
  description: string;
  confidence: number;
  coordinates: { latitude: number; longitude: number };
  detection_method: string;
  evidence_type: string;
  time_start: string;
  time_end: string;
  observed_at: string;
  quantity_estimate?: string;
  sex?: string;
  life_stage?: string;
  behavior?: string;
  is_captive?: boolean;
}

export interface Occurrence {
  id: string;
  author: { nickname: string; image: string; role: string };
  submitted_name: string;
  description: string;
  confidence: number;
  observed_at: string;
  status: string;
  is_visible: boolean;
  kingdom: string;
  detection_method: string;
  evidence_type: string;
  coordinates: { latitude: number; longitude: number };
}
