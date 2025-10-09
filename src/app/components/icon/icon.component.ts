import {Component, input, computed} from '@angular/core';
import {IconRegistryService} from '../../services/icon-registry/icon-registry.service';
import {IconName} from '../../services/icon-registry/icon-registry.model';

type Color = 'black' | 'white';

const SIZE = {
  s: '15px',
  m: '25px',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  name = input<IconName | null>(null);
  color = input<Color>('black');
  size = input(SIZE.s);


  svg = computed(() => this.iconRegistry.getIcon(this.name()));

  constructor(private iconRegistry: IconRegistryService) {
  }

}
