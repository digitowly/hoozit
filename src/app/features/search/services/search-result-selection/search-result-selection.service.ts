import { Injectable, signal } from '@angular/core';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import {
  ClientStorageService,
  ClientStorageKey,
} from '../../../../services/client-storage/client-storage.service';

export type SearchResultSelection = AnimalSearchResult;

@Injectable({ providedIn: 'root' })
export class SearchResultSelectionService {
  selections = signal<SearchResultSelection[]>([]);

  constructor(private clientStorage: ClientStorageService) {
    this.initSelections();
  }

  addSelection(selection: SearchResultSelection) {
    if (this.isSelected(selection)) return;

    const updatedSelections = [...this.selections(), selection];

    this.clientStorage.set(
      ClientStorageKey.SEARCH_SELECTIONS,
      updatedSelections,
    );

    this.selections.set(updatedSelections);
  }

  removeSelection(id: number) {
    const updatedSelections = this.selections().filter(
      (selection) => selection.id !== id,
    );

    this.clientStorage.set(
      ClientStorageKey.SEARCH_SELECTIONS,
      updatedSelections,
    );

    this.selections.set(updatedSelections);
  }

  hasIdenticalSelections(selections: SearchResultSelection[]): boolean {
    if (selections.length !== this.selections().length) return false;
    return selections.every((selection) => this.isSelected(selection));
  }

  private initSelections() {
    const storedSelections = this.getSelections();

    if (storedSelections) {
      this.selections.set(storedSelections);
    }
  }

  private getSelections(): SearchResultSelection[] | null {
    const selections = this.clientStorage.get<StoredSearchResultSelection[]>(
      ClientStorageKey.SEARCH_SELECTIONS,
    );
    if (!selections) return null;

    return selections.flatMap(({ gbif_key, taxonKey, ...selection }) => {
      const key = taxonKey ?? gbif_key;
      return key ? [{ ...selection, taxonKey: key }] : [];
    });
  }

  private isSelected(selection: SearchResultSelection): boolean {
    return this.selections().some(({ id }) => id === selection.id);
  }
}

type StoredSearchResultSelection = Omit<SearchResultSelection, 'taxonKey'> & {
  taxonKey?: string;
  gbif_key?: string;
};
