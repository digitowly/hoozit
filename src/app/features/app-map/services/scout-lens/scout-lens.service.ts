import { Injectable, signal } from '@angular/core';

export type LensPhase = 'anchored' | 'scouting' | 'zoomedOut';

export const SCOUT_MIN_ZOOM = 11;

const DETACH_FRACTION = 0.08;
const REATTACH_FRACTION = 0.035;

export interface LensUpdate {
  zoom: number;
  userOffset: { nx: number; ny: number } | null;
}

@Injectable({ providedIn: 'root' })
export class ScoutLensService {
  readonly phase = signal<LensPhase>('anchored');

  update({ zoom, userOffset }: LensUpdate) {
    this.phase.set(this.nextPhase(zoom, userOffset));
  }

  private nextPhase(
    zoom: number,
    userOffset: LensUpdate['userOffset'],
  ): LensPhase {
    if (zoom < SCOUT_MIN_ZOOM) return 'zoomedOut';
    if (!userOffset) return 'scouting';

    const { nx, ny } = userOffset;
    if (this.phase() === 'anchored') {
      return nx > DETACH_FRACTION || ny > DETACH_FRACTION
        ? 'scouting'
        : 'anchored';
    }
    return nx < REATTACH_FRACTION && ny < REATTACH_FRACTION
      ? 'anchored'
      : 'scouting';
  }
}
