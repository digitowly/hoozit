import { Component, input, computed } from '@angular/core';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { OccurrenceItemComponent } from '../occurrence-item/occurrence-item.component';
import { AnimalSearchService } from '../../../../services/animal-search/animal-search.service';
import { ActiveOccurrenceService } from '../../../../services/active-occurrence/active-occurrence.service';

@Component({
  selector: 'occurrences-list',
  imports: [OccurrenceItemComponent],
  templateUrl: './occurrences-list.component.html',
  styleUrl: './occurrences-list.component.scss',
})
export class OccurrencesListComponent {
  occurrences = input<AnimalSearchResult[]>([]);

  isVisible = computed(
    () => this.occurrences().length > 0 || this.animalSearch?.isLoading()
  );

  constructor(
    public animalSearch: AnimalSearchService,
    private activeOccurrence: ActiveOccurrenceService
  ) {}

  handleClick(result: AnimalSearchResult) {
    this.activeOccurrence.setActiveOccurrence(result);
  }
}
