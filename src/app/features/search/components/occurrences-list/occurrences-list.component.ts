import { Component, input, computed, inject } from '@angular/core';
import { AnimalSearchResult } from '../../../../model/animal-search-result';
import { OccurrenceItemComponent } from '../occurrence-item/occurrence-item.component';
import { VerdexService } from '../../../../services/verdex/verdex.service';
import { ActiveOccurrenceService } from '../../../../services/active-occurrence/active-occurrence.service';

@Component({
  selector: 'occurrences-list',
  imports: [OccurrenceItemComponent],
  templateUrl: './occurrences-list.component.html',
  styleUrl: './occurrences-list.component.scss',
})
export class OccurrencesListComponent {
  occurrences = input<AnimalSearchResult[]>([]);

  isVisible = computed(
    () => this.occurrences().length > 0 || this.verdexService?.isLoading()
  );

  public readonly verdexService = inject(VerdexService);
  private readonly activeOccurrenceService = inject(ActiveOccurrenceService);

  handleClick(result: AnimalSearchResult) {
    this.activeOccurrenceService.setActiveOccurrence(result);
  }
}
