import { Component, input, output } from '@angular/core';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { SearchResultListComponent } from '../search-result-list/search-result-list.component';
import { SearchFormComponent } from '../search-form/search-form.component';

@Component({
  selector: 'occurrence-search',
  imports: [SearchResultListComponent, SearchFormComponent],
  templateUrl: './occurrence-search.component.html',
  styleUrl: './occurrence-search.component.scss',
})
export class OccurrenceSearchComponent {
  occurrences = input<AnimalSearchResult[]>([]);
  isLoading = input(false);
  isActive = input(false);
  onResultSelection = output();
  onSearch = output<string>();

  onSelect() {
    this.onResultSelection.emit();
  }

  handleSearch(searchTerm: string) {
    console.log({ searchTerm });
    this.onSearch.emit(searchTerm);
  }
}
