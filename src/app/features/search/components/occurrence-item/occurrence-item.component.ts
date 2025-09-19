import { Component, input } from '@angular/core';
import { Occurrence } from '../../../../model/occurrence';

@Component({
  selector: 'occurrence-item',
  imports: [],
  templateUrl: './occurrence-item.component.html',
  styleUrl: './occurrence-item.component.scss',
})
export class OccurrenceItemComponent {
  occurrence = input<Occurrence>();
}
