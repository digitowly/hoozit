export class SelectionDockAnimation {
  private cleanup: (() => void) | undefined;

  stop() {
    this.cleanup?.();
  }

  toggle(dock: HTMLElement, expanded: boolean, applyExpandedState: () => void) {
    if (
      typeof dock.animate !== 'function' ||
      typeof matchMedia !== 'function' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.stop();
      applyExpandedState();
      return;
    }

    const beforeBounds = dock.getBoundingClientRect();
    const images = this.captureBounds(dock, '.item img');
    const surfaces = this.captureBounds(dock, '.item-surface');
    const outgoing = !expanded ? this.captureDetails(dock) : [];
    const toggleButton = dock.querySelector<HTMLElement>('.toggle-button')!;
    const beforeButton = toggleButton.getBoundingClientRect();
    const chevron = dock.querySelector<HTMLElement>('.chevron')!;
    const beforeRotation = getComputedStyle(chevron).transform;
    this.cleanup?.();
    dock.classList.add('selection-dock--morphing');
    applyExpandedState();
    dock.classList.toggle('selection-dock--expanded', expanded);
    chevron.classList.toggle('chevron--open', expanded);

    const afterBounds = dock.getBoundingClientRect();
    const afterButton = toggleButton.getBoundingClientRect();
    const rotation = getComputedStyle(chevron).transform;
    const options = this.animationOptions(dock);
    const animations: Animation[] = [];
    const ghosts = this.createGhostLayer(beforeBounds, afterBounds);

    animations.push(
      ...this.animateBounds(images, options),
      ...this.animateBounds(surfaces, options, true),
    );
    if (expanded) {
      animations.push(...this.revealDetails(dock));
    } else {
      animations.push(
        ...this.dismissDetails(dock, outgoing, ghosts, afterBounds),
      );
      dock.append(ghosts);
    }
    animations.push(
      chevron.animate(
        [{ transform: beforeRotation }, { transform: rotation }],
        options,
      ),
    );
    const motion = toggleButton.animate(
      [
        {
          width: `${beforeButton.width}px`,
          height: `${beforeButton.height}px`,
        },
        {
          width: `${afterButton.width}px`,
          height: `${afterButton.height}px`,
        },
      ],
      options,
    );
    animations.push(motion);

    const cleanup = () => {
      this.cleanup = undefined;
      animations.forEach((animation) => {
        animation.onfinish = null;
        animation.cancel();
      });
      ghosts.remove();
      dock.classList.remove('selection-dock--morphing');
    };
    this.cleanup = cleanup;
    motion.onfinish = cleanup;
  }

  private captureBounds(dock: HTMLElement, selector: string) {
    return Array.from(
      dock.querySelectorAll<HTMLElement>(selector),
      (element) => ({
        element,
        bounds: element.getBoundingClientRect(),
      }),
    );
  }

  private animateBounds(
    frames: { element: HTMLElement; bounds: DOMRect }[],
    options: KeyframeAnimationOptions,
    scale = false,
  ) {
    return frames.map(({ element, bounds }) => {
      const target = element.getBoundingClientRect();
      const translation = `translate3d(${bounds.left - target.left}px, ${bounds.top - target.top}px, 0)`;
      const resize = scale
        ? ` scale(${target.width ? bounds.width / target.width : 1}, ${target.height ? bounds.height / target.height : 1})`
        : '';
      return element.animate(
        [
          { transform: translation + resize },
          { transform: 'translate3d(0, 0, 0) scale(1, 1)' },
        ],
        options,
      );
    });
  }

  private animationOptions(dock: HTMLElement): KeyframeAnimationOptions {
    const style = getComputedStyle(dock);
    const time = style.getPropertyValue('--morph-duration').trim();
    return {
      duration: parseFloat(time) * (time.endsWith('ms') ? 1 : 1000),
      easing: style.getPropertyValue('--morph-easing').trim(),
      fill: 'both',
    };
  }

  private createGhostLayer(beforeBounds: DOMRect, afterBounds: DOMRect) {
    const ghosts = document.createElement('span');
    ghosts.className = 'morph-ghosts';
    ghosts.setAttribute('aria-hidden', 'true');
    ghosts.inert = true;
    Object.assign(ghosts.style, {
      position: 'absolute',
      inset: '0',
      zIndex: '2',
      overflow: 'hidden',
      pointerEvents: 'none',
      width: `${Math.max(beforeBounds.width, afterBounds.width)}px`,
      height: `${Math.max(beforeBounds.height, afterBounds.height)}px`,
    });

    return ghosts;
  }

  private revealDetails(dock: HTMLElement) {
    const animations: Animation[] = [];
    dock
      .querySelectorAll<HTMLElement>('.item-label-clip, .item-remove-clip')
      .forEach((detail) => {
        animations.push(
          detail.animate(
            [
              { opacity: 0, transform: 'translate3d(0, 2px, 0)' },
              { opacity: 1, transform: 'translate3d(0, 0, 0)' },
            ],
            { duration: 100, delay: 25, fill: 'both' },
          ),
        );
      });
    return animations;
  }

  private dismissDetails(
    dock: HTMLElement,
    outgoing: ReturnType<SelectionDockAnimation['captureDetails']>,
    ghosts: HTMLElement,
    afterBounds: DOMRect,
  ) {
    const animations: Animation[] = [];
    const borderLeft = dock.clientLeft;
    const borderTop = dock.clientTop;
    for (const detail of outgoing) {
      const ghost = document.createElement('span');
      Object.assign(ghost.style, {
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        fontSize: '0.8125rem',
        fontWeight: '500',
        lineHeight: '1.5',
        whiteSpace: 'nowrap',
        left: `${detail.bounds.left - afterBounds.left - borderLeft}px`,
        top: `${detail.bounds.top - afterBounds.top - borderTop}px`,
        width: `${detail.bounds.width}px`,
        height: `${detail.bounds.height}px`,
        justifyContent: detail.icon ? 'center' : 'flex-start',
      });
      if (detail.icon) {
        detail.icon.setAttribute('width', '18');
        detail.icon.setAttribute('height', '18');
        ghost.append(detail.icon);
      } else {
        ghost.textContent = detail.text;
      }
      ghosts.append(ghost);
      animations.push(
        ghost.animate(
          [
            { opacity: detail.opacity, transform: 'translate3d(0, 0, 0)' },
            { opacity: 0, transform: 'translate3d(0, -2px, 0)' },
          ],
          { duration: 70, fill: 'both' },
        ),
      );
    }
    return animations;
  }

  private captureDetails(dock: HTMLElement) {
    return Array.from(
      dock.querySelectorAll<HTMLElement>('.item-label-clip, .item-remove-clip'),
      (element) => ({
        bounds: element.getBoundingClientRect(),
        opacity: getComputedStyle(element).opacity,
        text: element.querySelector('.item-label')?.textContent ?? '',
        icon: element.querySelector('svg')?.cloneNode(true) as
          SVGElement | undefined,
      }),
    ).filter(
      ({ bounds, opacity }) => bounds.width > 0 && parseFloat(opacity) > 0,
    );
  }
}
