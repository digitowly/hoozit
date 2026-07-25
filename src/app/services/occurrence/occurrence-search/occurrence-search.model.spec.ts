import { describe, expect, it } from 'vitest';
import {
  isOccurrenceSearchRadiusLevelLarger,
  largerOccurrenceSearchRadiusLevel,
  occurrenceSearchRadiusMetersForLevel,
} from './occurrence-search.model';

describe('occurrence search radius', () => {
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
