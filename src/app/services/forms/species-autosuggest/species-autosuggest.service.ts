import { computed, inject, Injectable } from '@angular/core';
import { AnimalSearchService } from '../../animal-search/animal-search.service';
import { AnimalSearchResult } from '../../animal-search/animal-search.model';
import { AutoSuggestEntry } from '../../../components/autosuggest/autosuggest.model';

@Injectable({ providedIn: 'root' })
export class SpeciesAutosuggestService {
  private readonly speciesSearchService = inject(AnimalSearchService);

  readonly speciesEntries = computed(() => {
    if (this.speciesSearchService.isNotAvailable()) {
      const query = this.speciesSearchService.debouncedQuery();
      return query ? [{ label: query, value: query }] : [];
    }

    return (
      this.speciesSearchService.resource
        .value()
        ?.data?.map(this.mapToAutoSuggestEntry) || []
    );
  });

  readonly selectedEntry = computed(() => {
    const query = this.speciesSearchService.debouncedQuery();
    const match = this.speciesEntries().find(
      (e) => e.label.toLowerCase() === query.toLowerCase(),
    );

    if (match) return match;

    if (query.length >= 3) {
      return {
        label: query,
        value: query,
      };
    }

    return null;
  });

  onChange(input: string) {
    this.speciesSearchService.searchAnimals(input);
  }

  private mapToAutoSuggestEntry(species: AnimalSearchResult): AutoSuggestEntry {
    return {
      label: species.name,
      value: species.binomial_name,
      icon: species.thumbnail,
    };
  }
}
