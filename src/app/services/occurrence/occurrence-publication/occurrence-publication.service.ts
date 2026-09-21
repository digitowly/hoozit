import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Occurrence, SubmissionStatus } from '../occurrence.model';

type PublicationAction = 'publish' | 'unpublish';

interface PublicationRequest {
  occurrenceId: string;
  action: PublicationAction;
}

const publishableStatuses = new Set<SubmissionStatus>([
  SubmissionStatus.GEO_CONTINENT_VERIFIED,
  SubmissionStatus.GEO_COUNTRY_VERIFIED,
  SubmissionStatus.GEO_REGION_VERIFIED,
  SubmissionStatus.GEO_LOCALITY_VERIFIED,
  SubmissionStatus.VERIFIED,
]);

@Injectable({ providedIn: 'root' })
export class OccurrencePublicationService {
  private readonly http = inject(HttpClient);
  private readonly activeRequest = signal<PublicationRequest | undefined>(
    undefined,
  );
  private readonly failedRequest = signal<PublicationRequest | undefined>(
    undefined,
  );

  readonly isLoading = computed(() => this.activeRequest() !== undefined);

  async publish(
    occurrence: Pick<Occurrence, 'id' | 'status' | 'is_visible'>,
  ): Promise<boolean> {
    if (!this.canPublish(occurrence)) return false;

    return this.updateVisibility(occurrence.id, 'publish');
  }

  canPublish(occurrence: Pick<Occurrence, 'status' | 'is_visible'>): boolean {
    return !occurrence.is_visible && publishableStatuses.has(occurrence.status);
  }

  async unpublish(
    occurrence: Pick<Occurrence, 'id' | 'is_visible'>,
  ): Promise<boolean> {
    if (!occurrence.is_visible) return false;

    return this.updateVisibility(occurrence.id, 'unpublish');
  }

  isPublishing(occurrenceId: string): boolean {
    return this.matchesRequest(this.activeRequest(), occurrenceId, 'publish');
  }

  hasPublishError(occurrenceId: string): boolean {
    return this.matchesRequest(this.failedRequest(), occurrenceId, 'publish');
  }

  private async updateVisibility(
    occurrenceId: string,
    action: PublicationAction,
  ): Promise<boolean> {
    if (this.isLoading()) return false;

    const request = { occurrenceId, action };
    this.failedRequest.set(undefined);
    this.activeRequest.set(request);

    try {
      await firstValueFrom(
        this.http.patch<void>(
          `${environment.scoutUrl}/user/occurrences/${occurrenceId}/${action}`,
          {},
          { withCredentials: true },
        ),
      );
      return true;
    } catch {
      this.failedRequest.set(request);
      return false;
    } finally {
      this.activeRequest.set(undefined);
    }
  }

  private matchesRequest(
    request: PublicationRequest | undefined,
    occurrenceId: string,
    action: PublicationAction,
  ): boolean {
    return request?.occurrenceId === occurrenceId && request.action === action;
  }
}
