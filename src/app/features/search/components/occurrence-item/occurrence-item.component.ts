import { Component, input } from '@angular/core';
import { AnimalSearchResult } from '../../../../model/animal-search-result';

@Component({
  selector: 'occurrence-item',
  imports: [],
  templateUrl: './occurrence-item.component.html',
  styleUrl: './occurrence-item.component.scss',
})
export class OccurrenceItemComponent {
  occurrence = input<AnimalSearchResult>();
}
