import {
  Component,
  EventEmitter,
  input,
  effect,
  Output,
  signal,
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
  isLoading = signal<boolean>(false);

  constructor(
    private verdexService: VerdexService,
    private activeOccurrenceService: ActiveOccurrenceService
  ) {
    effect(() => {
      this.isLoading.set(this.verdexService.isLoading());
    });
  }

  handleClick(occurrence: Occurrence) {
    this.activeOccurrenceService.setActiveOccurrence(occurrence);
  }
}
