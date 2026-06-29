import {
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { IconComponent } from '../../../../components/icon/icon.component';
import { LensPhase } from '../../services/scout-lens/scout-lens.service';

const GLIDE_DURATION_MS = 500;

export interface ScoutLensCircle {
  x: number;
  y: number;
  radius: number;
  loading: boolean;
  failed?: boolean;
}

export interface ScoutLensPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'scout-lens',
  imports: [IconComponent],
  templateUrl: './scout-lens.component.html',
  styleUrl: './scout-lens.component.scss',
})
export class ScoutLensComponent {
  readonly phase = input.required<LensPhase>();
  readonly activeLens = input<ScoutLensCircle>({
    x: 0,
    y: 0,
    radius: 0,
    loading: false,
    failed: false,
  });
  readonly ghostLens = input<ScoutLensCircle | null>(null);
  readonly userIndicator = input<ScoutLensPoint | null>(null);
  readonly zooming = input(false);
  readonly searchHere = output<void>();
  readonly retry = output<void>();

  readonly gliding = signal(false);

  readonly showFailure = computed(
    () =>
      this.activeLens().failed &&
      !this.activeLens().loading &&
      this.phase() !== 'zoomedOut',
  );

  constructor() {
    let previousPhase: LensPhase | null = null;
    let glideTimer: ReturnType<typeof setTimeout> | null = null;

    effect(() => {
      const phase = this.phase();
      if (previousPhase !== null && phase !== previousPhase) {
        this.gliding.set(true);
        if (glideTimer) clearTimeout(glideTimer);
        glideTimer = setTimeout(
          () => this.gliding.set(false),
          GLIDE_DURATION_MS,
        );
      }
      previousPhase = phase;
    });
  }
}
