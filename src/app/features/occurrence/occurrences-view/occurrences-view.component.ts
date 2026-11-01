import { Component, inject } from '@angular/core';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import { SubmittedOccurrencesComponent } from '../submitted-occurrences/submitted-occurrences.component';
import { ContentContainerComponent } from '../../../components/content-container/content-container.component';

@Component({
  selector: 'occurrences-view',
  imports: [SubmittedOccurrencesComponent, ContentContainerComponent],
  templateUrl: './occurrences-view.component.html',
  styleUrl: './occurrences-view.component.scss',
})
export class OccurrencesViewComponent {
  constructor() {
    inject(UserOccurrencesService).resource.reload();
  }
}
