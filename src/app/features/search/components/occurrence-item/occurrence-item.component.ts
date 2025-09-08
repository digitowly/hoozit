import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Occurrence } from '../../../../model/occurrence';

@Component({
  selector: 'occurrence-item',
  imports: [],
  templateUrl: './occurrence-item.component.html',
  styleUrl: './occurrence-item.component.scss',
})
export class OccurrenceItemComponent {
  @Input() occurrence?: Occurrence;
}
