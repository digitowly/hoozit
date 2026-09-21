import { computed, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Occurrence, SubmissionStatus } from '../occurrence.model';
import { OccurrenceValidationResponse } from './occurrence-validation.model';

interface ValidationRequest {
  occurrenceId: string;
  sequence: number;
}

@Injectable({ providedIn: 'root' })
export class OccurrenceValidationService {
  private readonly request = signal<ValidationRequest | undefined>(undefined);
  private sequence = 0;

  readonly occurrenceId = computed(() => this.request()?.occurrenceId);

  readonly resource = httpResource<OccurrenceValidationResponse>(() => {
    const request = this.request();
    if (!request) return undefined;

    return {
      url: `${environment.scoutUrl}/user/occurrence/${request.occurrenceId}/validate`,
      method: 'POST',
      body: {},
      withCredentials: true,
    };
  });

  validate(occurrence: Pick<Occurrence, 'id' | 'status'>): boolean {
    if (
      occurrence.status !== SubmissionStatus.DRAFT ||
      this.resource.isLoading()
    ) {
      return false;
    }

    this.request.set({
      occurrenceId: occurrence.id,
      sequence: ++this.sequence,
    });
    return true;
  }

  isValidating(occurrenceId: string): boolean {
    return this.occurrenceId() === occurrenceId && this.resource.isLoading();
  }

  hasError(occurrenceId: string): boolean {
    return (
      this.occurrenceId() === occurrenceId && this.resource.status() === 'error'
    );
  }
}
