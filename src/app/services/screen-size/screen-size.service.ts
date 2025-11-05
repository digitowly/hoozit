import { effect, Injectable, signal } from '@angular/core';

export enum ScreenSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

const SMALL_BREAKPOINT = 768;
const MEDIUM_BREAKPOINT = 1024;

@Injectable({ providedIn: 'root' })
export class ScreenSizeService {
  size = signal<ScreenSize>(ScreenSize.SMALL);
  isInitialized = signal(false);

  constructor() {
    effect((onCleanup) => {
      this.handleResize();
      window.addEventListener('resize', this.handleResize);
      onCleanup(() => {
        window.removeEventListener('resize', this.handleResize);
      });
      this.isInitialized.set(true);
    });
  }

  handleResize() {
    if (window !== undefined) {
      if (window.innerWidth < SMALL_BREAKPOINT) {
        return this.size.set(ScreenSize.SMALL);
      } else if (window.innerWidth < MEDIUM_BREAKPOINT) {
        return this.size.set(ScreenSize.MEDIUM);
      } else {
        return this.size.set(ScreenSize.LARGE);
      }
    }
  }
}
