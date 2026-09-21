import { Component, computed, effect, inject } from '@angular/core';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import {
  Occurrence,
  SubmissionStatus,
} from '../../../services/occurrence/occurrence.model';
import { IconComponent } from '../../../components/icon/icon.component';
import { TooltipDirective } from '../../../components/tooltip/tooltip.directive';
import { OccurrenceValidationService } from '../../../services/occurrence/occurrence-validation/occurrence-validation.service';
import { OccurrencePublicationService } from '../../../services/occurrence/occurrence-publication/occurrence-publication.service';
import { OccurrenceValidationIndicatorsComponent } from './validation-indicators/validation-indicators.component';

@Component({
  selector: 'submitted-occurrences',
  imports: [
    IconComponent,
    TooltipDirective,
    OccurrenceValidationIndicatorsComponent,
  ],
  templateUrl: './submitted-occurrences.component.html',
  styleUrl: './submitted-occurrences.component.scss',
})
export class SubmittedOccurrencesComponent {
  private readonly userOccurrencesService = inject(UserOccurrencesService);
  protected readonly validationService = inject(OccurrenceValidationService);
  protected readonly publicationService = inject(OccurrencePublicationService);
  protected readonly SubmissionStatus = SubmissionStatus;

  protected readonly occurrences = computed<Occurrence[]>(() => {
    const occurrences = this.userOccurrencesService.resource.value() || [];
    if (this.validationService.resource.status() !== 'resolved') {
      return occurrences;
    }

    const result = this.validationService.resource.value();
    if (!result) return occurrences;

    return occurrences.map((occurrence) =>
      occurrence.id === result.id
        ? { ...occurrence, status: result.status }
        : occurrence,
    );
  });

  constructor() {
    effect(() => {
      if (this.validationService.resource.status() === 'resolved') {
        this.userOccurrencesService.resource.reload();
      }
    });
  }

  protected validate(occurrence: Occurrence): void {
    this.validationService.validate(occurrence);
  }

  protected async publish(occurrence: Occurrence): Promise<void> {
    if (await this.publicationService.publish(occurrence)) {
      this.userOccurrencesService.resource.reload();
    }
  }
}
