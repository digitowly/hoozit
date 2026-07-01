export type OccurrenceSearchRadiusLevel = 1 | 2 | 3 | 4 | 5;

export const OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL: OccurrenceSearchRadiusLevel = 3;

export const OCCURRENCE_SEARCH_RADIUS_METERS_BY_LEVEL: Record<
  OccurrenceSearchRadiusLevel,
  number
> = {
  1: 250,
  2: 500,
  3: 1_000,
  4: 2_000,
  5: 5_000,
};

export function occurrenceSearchRadiusLevelForZoom(
  zoom: number,
): OccurrenceSearchRadiusLevel {
  if (zoom >= 18) return 1;
  if (zoom >= 16) return 2;
  if (zoom >= 13) return 3;
  if (zoom >= 12) return 4;
  return 5;
}

export function occurrenceSearchRadiusMetersForLevel(
  level: OccurrenceSearchRadiusLevel,
): number {
  return OCCURRENCE_SEARCH_RADIUS_METERS_BY_LEVEL[level];
}

export function isOccurrenceSearchRadiusLevelLarger(
  level: OccurrenceSearchRadiusLevel,
  otherLevel: OccurrenceSearchRadiusLevel,
): boolean {
  return (
    occurrenceSearchRadiusMetersForLevel(level) >
    occurrenceSearchRadiusMetersForLevel(otherLevel)
  );
}

export function largerOccurrenceSearchRadiusLevel(
  level: OccurrenceSearchRadiusLevel,
  otherLevel: OccurrenceSearchRadiusLevel,
): OccurrenceSearchRadiusLevel {
  return isOccurrenceSearchRadiusLevelLarger(level, otherLevel)
    ? level
    : otherLevel;
}

export interface OccurrenceSearchRequest {
  latitude: number;
  longitude: number;
  radius_level: OccurrenceSearchRadiusLevel;
  taxon_keys: string[];
}

export interface OccurrenceSearchResponse {
  total: number;
  results: OccurrenceSearchResult[];
}

export interface OccurrenceSearchResult {
  id: string;
  taxon_key?: string;
  source: string;
  name: {
    display: string;
    scientific?: string;
  };
  observed_at?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  status: string;
  author?: {
    nickname: string;
    image?: string;
  };
}
