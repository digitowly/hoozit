import { Component, signal } from '@angular/core';
import {
  AnimalSearchResult,
  AnimalSearchResponse,
} from '../../../../services/animal-search/animal-search.model';
import { OccurrencesListComponent } from '../occurrences-list/occurrences-list.component';
import { OccurrenceSearchFormComponent } from '../occurrence-search-form/occurrence-search-form.component';

@Component({
  selector: 'occurrence-search',
  imports: [OccurrencesListComponent, OccurrenceSearchFormComponent],
  templateUrl: './occurrence-search.component.html',
  styleUrl: './occurrence-search.component.scss',
})
export class OccurrenceSearchComponent {
  title = 'habinaut-angular';
  occurrences = signal<AnimalSearchResult[]>([]);

  setOccurrences(occurrenceResponse: AnimalSearchResponse) {
    this.occurrences.set(occurrenceResponse.data);
  }
}
