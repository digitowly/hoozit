import { Component, signal } from '@angular/core';
import { Occurrence, OccurrenceResponse } from './model/occurrence';
import { FormsModule } from '@angular/forms';
import { OccurrenceSearchComponent } from './occurrence-search/occurrence-search.component';
import { OccurrencesListComponent } from './occurrences-list/occurrences-list.component';

@Component({
  selector: 'app-root',
  imports: [FormsModule, OccurrenceSearchComponent, OccurrencesListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'habinaut-angular';
  occurrences = signal<Occurrence[] | null>(null);
  activeOccurrence: Occurrence | null = null;

  setOccurrences(occurrenceResponse: OccurrenceResponse) {
    this.occurrences.set(occurrenceResponse.data);
  }

  handleOccurrenceClicked(occurrence: Occurrence) {
    this.activeOccurrence = occurrence;
  }
}
