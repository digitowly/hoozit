import { beforeEach, describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ScoutLensService, SCOUT_MIN_ZOOM } from './scout-lens.service';

describe('ScoutLensService', () => {
  let service: ScoutLensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoutLensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts anchored', () => {
    expect(service.phase()).toBe('anchored');
  });

  it('switches to zoomedOut below the scout zoom', () => {
    service.update({
      zoom: SCOUT_MIN_ZOOM - 1,
      userOffset: { nx: 0, ny: 0 },
    });
    expect(service.phase()).toBe('zoomedOut');
  });

  it('scouts when the user location is unknown', () => {
    service.update({ zoom: 13, userOffset: null });
    expect(service.phase()).toBe('scouting');
  });

  it('stays anchored for small offsets', () => {
    service.update({ zoom: 13, userOffset: { nx: 0.05, ny: 0.02 } });
    expect(service.phase()).toBe('anchored');
  });

  it('detaches when the user moves clearly away from the center', () => {
    service.update({ zoom: 13, userOffset: { nx: 0.1, ny: 0 } });
    expect(service.phase()).toBe('scouting');
  });

  it('does not reattach until the user is back inside the snap area', () => {
    service.update({ zoom: 13, userOffset: { nx: 0.1, ny: 0 } });
    // Inside the detach threshold but outside the reattach threshold.
    service.update({ zoom: 13, userOffset: { nx: 0.05, ny: 0 } });
    expect(service.phase()).toBe('scouting');

    service.update({ zoom: 13, userOffset: { nx: 0.03, ny: 0.02 } });
    expect(service.phase()).toBe('anchored');
  });

  it('recovers from zoomedOut based on the user offset', () => {
    service.update({ zoom: SCOUT_MIN_ZOOM - 1, userOffset: { nx: 0, ny: 0 } });
    expect(service.phase()).toBe('zoomedOut');

    service.update({ zoom: 13, userOffset: { nx: 0.02, ny: 0.02 } });
    expect(service.phase()).toBe('anchored');
  });
});
