import { Component, effect, input, output, signal } from '@angular/core';
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
  defaultTerm = signal('');
  occurrences = input<AnimalSearchResult[]>([]);
  isLoading = input(false);
  isActive = input(false);
  isResultListManuallyHidden = signal(false);
  onResultSelection = output();
  onSearch = output<string>();

  constructor() {
    effect((onCleanup) => {
      const hideOnEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') this.hideResultList();
      };

      window.addEventListener('keydown', hideOnEscape);
      onCleanup(() => {
        window.removeEventListener('keydown', hideOnEscape);
      });
    });
  }

  showResultList() {
    this.isResultListManuallyHidden.set(false);
  }

  hideResultList() {
    this.isResultListManuallyHidden.set(true);
  }

  onSelect(result: AnimalSearchResult) {
    this.onResultSelection.emit();
    this.defaultTerm.set(result.name);
  }

  handleSearch(searchTerm: string) {
    console.log({ searchTerm });
    this.onSearch.emit(searchTerm);
  }
}
