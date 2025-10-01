import { Injectable, signal } from '@angular/core';
import { AnimalSearchResult } from '../animal-search/animal-search.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveOccurrenceService {
  private static readonly STORAGE_KEY = 'activeOccurrence';
  private activeOccurrence = signal<AnimalSearchResult | null>(null);

  setActiveOccurrence(occurrence: AnimalSearchResult | null) {
    localStorage.setItem(
      ActiveOccurrenceService.STORAGE_KEY,
      JSON.stringify(occurrence)
    );
    this.activeOccurrence.set(occurrence);
  }

  getActiveOccurrence(): AnimalSearchResult | null {
    const occurrence = localStorage.getItem(
      ActiveOccurrenceService.STORAGE_KEY
    );
    if (occurrence) {
      this.activeOccurrence.set(JSON.parse(occurrence));
    }
    return this.activeOccurrence();
  }
}
