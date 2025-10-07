import { Component, input, computed } from '@angular/core';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { OccurrenceItemComponent } from '../occurrence-item/occurrence-item.component';
import { AnimalSearchService } from '../../../../services/animal-search/animal-search.service';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';

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
    private searchResultSelection: SearchResultSelectionService
  ) {}

  handleClick(result: AnimalSearchResult) {
    this.searchResultSelection.addSelection(result);
  }
}
