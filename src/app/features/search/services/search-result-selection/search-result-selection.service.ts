import { Injectable, signal } from '@angular/core';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import {
  ClientStorageService,
  ClientStorageKey,
} from '../../../../services/client-storage/client-storage.service';

@Injectable({
  providedIn: 'root',
})
export class SearchResultSelectionService {
  selections = signal<AnimalSearchResult[]>([]);

  constructor(private clientStorage: ClientStorageService) {
    this.initSelections();
  }

  addSelection(selection: AnimalSearchResult) {
    if (this.isSelected(selection)) return;

    const updatedSelections = [...this.selections(), selection];

    this.clientStorage.set(
      ClientStorageKey.SEARCH_SELECTIONS,
      updatedSelections
    );

    this.selections.set(updatedSelections);
  }

  removeSelection(id: number) {
    const updatedSelections = this.selections().filter(
      (selection) => selection.id !== id
    );

    this.clientStorage.set(
      ClientStorageKey.SEARCH_SELECTIONS,
      updatedSelections
    );

    this.selections.set(updatedSelections);
  }

  private initSelections() {
    const storedSelections = this.getSelections();

    if (storedSelections) {
      this.selections.set(storedSelections);
    }
  }

  private getSelections(): AnimalSearchResult[] | null {
    return this.clientStorage.get(ClientStorageKey.SEARCH_SELECTIONS);
  }

  private isSelected(selection: AnimalSearchResult): boolean {
    return this.selections().some(({ id }) => id === selection.id);
  }
}
