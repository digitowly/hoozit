import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../../../../components/icon/icon.component';
import { SubmissionStatus } from '../../../../services/occurrence/occurrence.model';

@Component({
  selector: 'occurrence-validation-indicators',
  imports: [IconComponent],
  templateUrl: './validation-indicators.component.html',
  styleUrl: './validation-indicators.component.scss',
})
export class OccurrenceValidationIndicatorsComponent {
  readonly status = input.required<SubmissionStatus>();

  protected readonly validationSteps = [
    'name',
    'continent',
    'area',
    'locality',
  ] as const;

  protected readonly completedSteps = computed(() => {
    switch (this.status()) {
      case SubmissionStatus.NAME_VERIFIED:
        return 1;
      case SubmissionStatus.GEO_CONTINENT_VERIFIED:
      case SubmissionStatus.GEO_COUNTRY_VERIFIED:
        return 2;
      case SubmissionStatus.GEO_REGION_VERIFIED:
        return 3;
      case SubmissionStatus.GEO_LOCALITY_VERIFIED:
      case SubmissionStatus.VERIFIED:
        return 4;
      default:
        return 0;
    }
  });

  protected isStepComplete(stepIndex: number): boolean {
    return stepIndex < this.completedSteps();
  }
}
