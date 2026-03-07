import { Component, computed, inject, input } from '@angular/core';
import { IconRegistryService } from '../../services/icon-registry/icon-registry.service';
import { IconName } from '../../services/icon-registry/icon-registry.model';

type Color = 'color-primary-dark' | 'color-neutral-light';
type Size = 'size-small' | 'size-medium' | 'size-large';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  readonly name = input<IconName | null>(null);
  readonly color = input<Color>('color-primary-dark');
  readonly size = input<Size>('size-medium');

  private readonly iconRegistry = inject(IconRegistryService);

  readonly svg = computed(() => this.iconRegistry.getIcon(this.name()));
}
