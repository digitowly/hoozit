import { Component, computed, input } from '@angular/core';

export type ButtonContainerDirection = 'horizontal' | 'vertical';
const MIN_GAP_PX = 5;

@Component({
  selector: 'app-button-container',
  templateUrl: './button-container.component.html',
  styleUrl: './button-container.component.scss',
})
export class ButtonContainerComponent {
  readonly direction = input<ButtonContainerDirection>('horizontal');
  readonly gap = input(MIN_GAP_PX);
  readonly renderedGap = computed(() => Math.max(this.gap(), MIN_GAP_PX));
}
