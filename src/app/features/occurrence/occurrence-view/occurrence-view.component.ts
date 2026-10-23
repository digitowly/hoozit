import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { ContentContainerComponent } from '../../../components/content-container/content-container.component';
import { IconComponent } from '../../../components/icon/icon.component';
import { Occurrence } from '../../../services/occurrence/occurrence.model';
import { OccurrenceValidationService } from '../../../services/occurrence/occurrence-validation/occurrence-validation.service';
import { UserOccurrenceService } from '../../../services/occurrence/user-occurrences/user-occurrence.service';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import { OccurrenceStateLabelsComponent } from '../components/occurrence-state-labels/occurrence-state-labels.component';
import { OccurrenceLocationMapComponent } from './occurrence-location-map/occurrence-location-map.component';

@Component({
  selector: 'occurrence-view',
  imports: [
    ContentContainerComponent,
    DatePipe,
    IconComponent,
    OccurrenceLocationMapComponent,
    OccurrenceStateLabelsComponent,
  ],
  templateUrl: './occurrence-view.component.html',
  styleUrl: './occurrence-view.component.scss',
})
export class OccurrenceViewComponent {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly userOccurrenceService = inject(UserOccurrenceService);
  private readonly userOccurrencesService = inject(UserOccurrencesService);
  private readonly validationService = inject(OccurrenceValidationService);
  private validationReloadPending = false;

  private readonly params = toSignal(this.activatedRoute.params, {
    initialValue: { id: '' },
  });

  protected readonly occurrence = computed<Occurrence | undefined>(() => {
    const occurrence = this.userOccurrenceService.resource.value();
    const validationResult = this.validationService.resource.value();

    if (
      !occurrence ||
      this.validationService.resource.status() !== 'resolved' ||
      validationResult?.id !== occurrence.id
    ) {
      return occurrence;
    }

    return { ...occurrence, status: validationResult.status };
  });
  protected readonly isLoading = computed(() =>
    this.userOccurrenceService.resource.isLoading(),
  );
  protected readonly pageTitle = computed(
    () => this.occurrence()?.submitted_name || 'Occurrence details',
  );
  protected readonly confidencePercentage = computed(() =>
    Math.round((this.occurrence()?.confidence ?? 0) * 100),
  );

  constructor() {
    effect(() => {
      this.userOccurrenceService.id.set(this.params().id);
    });

    effect(() => {
      const validationStatus = this.validationService.resource.status();
      const validationResult = this.validationService.resource.value();
      const occurrenceStatus = this.userOccurrenceService.resource.status();

      if (
        validationStatus !== 'resolved' ||
        validationResult?.id !== this.userOccurrenceService.id()
      ) {
        this.validationReloadPending = false;
        return;
      }

      if (!this.validationReloadPending) {
        this.validationReloadPending =
          this.userOccurrenceService.resource.reload();
        return;
      }

      if (occurrenceStatus === 'resolved') {
        this.validationService.resource.set(undefined);
        this.validationReloadPending = false;
      }
    });
  }

  protected displayValue(value: string): string {
    return value.replaceAll('_', ' ');
  }

  protected reloadAfterVisibilityChange(): void {
    this.userOccurrenceService.resource.reload();
    this.userOccurrencesService.resource.reload();
  }
}
