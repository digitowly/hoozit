import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  template: `<div class="tooltip">{{ text() }}</div>`,
  styles: [`
    .tooltip {
      background: #102e2d;
      color: #f5f7f8;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 0.75rem;
      line-height: 1.4;
      max-width: 240px;
      word-break: break-word;
      pointer-events: none;
      white-space: normal;
      animation: tooltip-in 120ms ease;
    }

    @keyframes tooltip-in {
      from { opacity: 0; transform: scale(0.92); }
      to   { opacity: 1; transform: scale(1); }
    }
  `],
})
export class TooltipComponent {
  readonly text = input.required<string>();
}
