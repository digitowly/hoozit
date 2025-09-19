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
import { VerdexService } from '../../../../services/verdex.service';

@Component({
  selector: 'occurrences-list',
  imports: [OccurrenceItemComponent],
  templateUrl: './occurrences-list.component.html',
  styleUrl: './occurrences-list.component.scss',
})
export class OccurrencesListComponent {
  occurrences = input<Occurrence[]>([]);
  isLoading = signal<boolean>(false);

  constructor(private verdexService: VerdexService) {
    effect(() => {
      this.isLoading.set(this.verdexService.isLoading());
    });
  }

  @Output() occurrenceClicked = new EventEmitter<Occurrence>();

  handleClick(occurrence: Occurrence) {
    this.occurrenceClicked.emit(occurrence);
  }
}
