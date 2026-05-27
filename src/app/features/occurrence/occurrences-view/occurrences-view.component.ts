import { Component } from '@angular/core';
import { SubmittedOccurrencesComponent } from '../submitted-occurrences/submitted-occurrences.component';
import { ContentContainerComponent } from '../../../components/content-container/content-container.component';

@Component({
  selector: 'occurrences-view',
  imports: [SubmittedOccurrencesComponent, ContentContainerComponent],
  templateUrl: './occurrences-view.component.html',
  styleUrl: './occurrences-view.component.scss',
})
export class OccurrencesViewComponent {}
