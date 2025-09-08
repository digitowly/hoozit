import { Component, signal } from '@angular/core';
import { Occurrence, OccurrenceResponse } from '../../../../model/occurrence';
import { OccurrencesListComponent } from '../occurrences-list/occurrences-list.component';
import { OccurrenceSearchFormComponent } from '../occurrence-search-form/occurrence-search-form.component';

@Component({
  selector: 'occurrence-search',
  imports: [OccurrencesListComponent, OccurrenceSearchFormComponent],
  templateUrl: './occurrence-search.component.html',
  styleUrl: './occurrence-search.component.scss',
})
export class OccurrenceSearchComponent {
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
