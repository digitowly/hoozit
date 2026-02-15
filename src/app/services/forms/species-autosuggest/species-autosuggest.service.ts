import { computed, inject, Injectable } from '@angular/core';
import { AnimalSearchService } from '../../animal-search/animal-search.service';
import { AnimalSearchResult } from '../../animal-search/animal-search.model';
import { AutoSuggestEntry } from '../../../components/autosuggest/autosuggest.model';

@Injectable({ providedIn: 'root' })
export class SpeciesAutosuggestService {
  private readonly speciesSearchService = inject(AnimalSearchService);

  readonly speciesEntries = computed(
    () =>
      this.speciesSearchService.resource
        .value()
        ?.data?.map(this.mapToAutoSuggestEntry) || [],
  );

  readonly selectedEntry = computed(() => {
    return this.speciesEntries().find(
      (e) =>
        e.label.toLowerCase() ===
        this.speciesSearchService.debouncedQuery().toLowerCase(),
    );
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
