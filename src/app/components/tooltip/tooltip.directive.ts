import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Directive, ElementRef, inject, input, OnDestroy, ViewContainerRef } from '@angular/core';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[tooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
  },
})
export class TooltipDirective implements OnDestroy {
  readonly tooltip = input.required<string>();

  private readonly overlay = inject(Overlay);
  private readonly elementRef = inject(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);

  private overlayRef: OverlayRef | null = null;

  show(): void {
    if (this.overlayRef || !this.tooltip().trim()) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        { originX: 'center', originY: 'top',    overlayX: 'center', overlayY: 'bottom', offsetY: -6 },
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top',    offsetY: 6  },
        { originX: 'end',    originY: 'center', overlayX: 'start',  overlayY: 'center', offsetX: 6  },
        { originX: 'start',  originY: 'center', overlayX: 'end',    overlayY: 'center', offsetX: -6 },
      ])
      .withViewportMargin(8)
      .withFlexibleDimensions(false)
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    const ref = this.overlayRef.attach(
      new ComponentPortal(TooltipComponent, this.viewContainerRef),
    );
    ref.setInput('text', this.tooltip());
  }

  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    this.overlayRef?.dispose();
  }
}
