export interface UserOccurrenceRequest {
  name: string;
  taxon_key?: string;
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

export enum SubmissionStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  NAME_VERIFIED = 'name_verified',
  GEO_CONTINENT_VERIFIED = 'geo_continent_verified',
  GEO_COUNTRY_VERIFIED = 'geo_country_verified',
  GEO_REGION_VERIFIED = 'geo_region_verified',
  GEO_LOCALITY_VERIFIED = 'geo_locality_verified',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  DELETED = 'deleted',
  UNKNOWN = 'unknown',
}

export interface Occurrence {
  id: string;
  author: { nickname: string; image: string; role: string };
  submitted_name: string;
  description: string;
  confidence: number;
  observed_at: string;
  status: SubmissionStatus;
  is_visible: boolean;
  kingdom: string;
  detection_method: string;
  evidence_type: string;
  coordinates: { latitude: number; longitude: number };
}
