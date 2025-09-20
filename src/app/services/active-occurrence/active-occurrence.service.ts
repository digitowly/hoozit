import { Injectable, signal } from '@angular/core';
import { Occurrence } from '../../model/occurrence';

@Injectable({
  providedIn: 'root',
})
export class ActiveOccurrenceService {
  private static readonly STORAGE_KEY = 'activeOccurrence';
  private activeOccurrence = signal<Occurrence | null>(null);

  setActiveOccurrence(occurrence: Occurrence | null) {
    localStorage.setItem(
      ActiveOccurrenceService.STORAGE_KEY,
      JSON.stringify(occurrence)
    );
    this.activeOccurrence.set(occurrence);
  }

  getActiveOccurrence() {
    const occurrence = localStorage.getItem(
      ActiveOccurrenceService.STORAGE_KEY
    );
    if (occurrence) {
      this.activeOccurrence.set(JSON.parse(occurrence));
    }
  }
}
