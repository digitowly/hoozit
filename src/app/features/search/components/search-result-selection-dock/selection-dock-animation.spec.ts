import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SelectionDockAnimation } from './selection-dock-animation';

describe('SelectionDockAnimation', () => {
  let dock: HTMLElement;
  let animation: SelectionDockAnimation;
  let motions: {
    cancel: ReturnType<typeof vi.fn>;
    onfinish: (() => void) | null;
  }[];

  beforeEach(() => {
    motions = [];
    animation = new SelectionDockAnimation();
    dock = document.createElement('div');
    dock.innerHTML =
      '<button class="toggle-button"><span class="chevron"></span></button><span class="item-surface"></span>';
    dock.style.setProperty('--morph-duration', '0.17s');
    dock.style.setProperty('--morph-easing', 'ease');
    document.body.append(dock);
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    vi.stubGlobal('getComputedStyle', window.getComputedStyle.bind(window));
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: vi.fn(() => {
        const motion = { cancel: vi.fn(), onfinish: null };
        motions.push(motion);
        return motion;
      }),
    });
  });

  afterEach(() => {
    animation.stop();
    dock.remove();
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
    vi.unstubAllGlobals();
  });

  it('applies the target rotation before measuring the expanded layout', () => {
    const update = vi.fn();
    animation.toggle(dock, true, update);

    expect(update).toHaveBeenCalledOnce();
    expect(dock.classList.contains('selection-dock--expanded')).toBe(true);
    expect(
      dock.querySelector('.chevron')?.classList.contains('chevron--open'),
    ).toBe(true);
    expect(motions.length).toBeGreaterThan(0);
  });

  it('cleans up all animations and outgoing details on completion', () => {
    animation.toggle(dock, false, vi.fn());
    expect(dock.querySelector('.morph-ghosts')).not.toBeNull();

    motions.at(-1)?.onfinish?.();

    expect(dock.querySelector('.morph-ghosts')).toBeNull();
    expect(dock.classList.contains('selection-dock--morphing')).toBe(false);
    motions.forEach((motion) => expect(motion.cancel).toHaveBeenCalledOnce());
  });

  it('cancels previous animations when toggled again', () => {
    animation.toggle(dock, false, vi.fn());
    const previous = [...motions];
    animation.toggle(dock, true, vi.fn());

    previous.forEach((motion) => expect(motion.cancel).toHaveBeenCalledOnce());
    expect(dock.querySelector('.morph-ghosts')).toBeNull();
  });

  it('updates state without animations when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const update = vi.fn();
    animation.toggle(dock, true, update);

    expect(update).toHaveBeenCalledOnce();
    expect(motions).toHaveLength(0);
  });
});
