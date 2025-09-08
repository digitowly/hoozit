import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { Occurrence } from '../model/occurrence';
import { OccurrenceItemComponent } from '../occurrence-item/occurrence-item.component';

@Component({
  selector: 'app-occurrences-list',
  imports: [OccurrenceItemComponent],
  templateUrl: './occurrences-list.component.html',
  styleUrl: './occurrences-list.component.scss',
})
export class OccurrencesListComponent {
  occurrences = input<Occurrence[]>([]);
  @Output() occurrenceClicked = new EventEmitter<Occurrence>();

  handleClick(occurrence: Occurrence) {
    console.log('emitting occurrence:', occurrence);
    this.occurrenceClicked.emit(occurrence);
  }

  // handleInput(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   const value = input.value.trim().toLowerCase();
  //   this.occurrences = this.occurrences.filter(occurrence =>
  //     occurrence.title.toLowerCase().includes(value)
  //   );
  // }
}
