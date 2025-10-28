import { Component, input, computed } from '@angular/core';
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
  name = input<IconName | null>(null);
  color = input<Color>('color-primary-dark');
  size = input<Size>('size-medium');

  svg = computed(() => this.iconRegistry.getIcon(this.name()));

  constructor(private iconRegistry: IconRegistryService) {}
}
