import {
  Component,
  EventEmitter,
  input,
  effect,
  Output,
  signal,
  computed,
} from '@angular/core';
import { Occurrence } from '../../../../model/occurrence';
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
  occurrences = input<Occurrence[]>([]);

  isVisible = computed(
    () => this.occurrences().length > 0 || this.verdexService?.isLoading()
  );

  constructor(
    public verdexService: VerdexService,
    private activeOccurrenceService: ActiveOccurrenceService
  ) {}

  handleClick(occurrence: Occurrence) {
    this.activeOccurrenceService.setActiveOccurrence(occurrence);
  }
}
