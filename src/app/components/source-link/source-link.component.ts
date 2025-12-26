import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'source-link',
  imports: [IconComponent],
  templateUrl: './source-link.component.html',
  styleUrl: './source-link.component.scss',
})
export class SourceLinkComponent {
  url = input('');
  label = input('');
}
