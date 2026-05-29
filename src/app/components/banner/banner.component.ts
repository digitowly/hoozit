import { Component, input } from '@angular/core';

type BannerVariant = 'info' | 'warning';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss',
})
export class BannerComponent {
  message = input('');
  variant = input<BannerVariant>('info');
}
