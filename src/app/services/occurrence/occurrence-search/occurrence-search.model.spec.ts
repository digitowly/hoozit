import { describe, expect, it } from 'vitest';
import {
  isOccurrenceSearchRadiusLevelLarger,
  largerOccurrenceSearchRadiusLevel,
  occurrenceSearchRadiusLevelForZoom,
  occurrenceSearchRadiusMetersForLevel,
} from './occurrence-search.model';

describe('occurrence search radius', () => {
  it('uses a larger Scout radius as the map zooms out', () => {
    expect(occurrenceSearchRadiusLevelForZoom(18)).toBe(1);
    expect(occurrenceSearchRadiusLevelForZoom(16)).toBe(2);
    expect(occurrenceSearchRadiusLevelForZoom(15)).toBe(3);
    expect(occurrenceSearchRadiusLevelForZoom(13)).toBe(3);
    expect(occurrenceSearchRadiusLevelForZoom(12)).toBe(4);
    expect(occurrenceSearchRadiusLevelForZoom(11)).toBe(5);
  });

  it('matches Scout radius level meter mappings', () => {
    expect(occurrenceSearchRadiusMetersForLevel(1)).toBe(250);
    expect(occurrenceSearchRadiusMetersForLevel(3)).toBe(1000);
    expect(occurrenceSearchRadiusMetersForLevel(5)).toBe(5000);
  });

  it('compares radius levels by mapped meters', () => {
    expect(isOccurrenceSearchRadiusLevelLarger(5, 3)).toBe(true);
    expect(isOccurrenceSearchRadiusLevelLarger(2, 4)).toBe(false);
    expect(largerOccurrenceSearchRadiusLevel(2, 4)).toBe(4);
  });
});
