import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';

import { IconComponent } from '../../../../components/icon/icon.component';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { IconName } from '../../../../services/icon-registry/icon-registry.model';
import { ModalService } from '../../../../services/modal/modal.service';
import { OccurrencePublicationService } from '../../../../services/occurrence/occurrence-publication/occurrence-publication.service';
import { OccurrenceValidationService } from '../../../../services/occurrence/occurrence-validation/occurrence-validation.service';
import { UserProfileService } from '../../../../services/user/user-data/user-profile.service';
import {
  Occurrence,
  SubmissionStatus,
} from '../../../../services/occurrence/occurrence.model';
import { OccurrenceValidationIndicatorsComponent } from '../occurrence-validation-indicators/occurrence-validation-indicators.component';

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  [SubmissionStatus.DRAFT]: $localize`:@@occurrenceStatus_draft:Draft`,
  [SubmissionStatus.IN_REVIEW]: $localize`:@@occurrenceStatus_inReview:In review`,
  [SubmissionStatus.NAME_VERIFIED]: $localize`:@@occurrenceStatus_nameVerified:Name verified`,
  [SubmissionStatus.GEO_CONTINENT_VERIFIED]: $localize`:@@occurrenceStatus_continentVerified:Continent verified`,
  [SubmissionStatus.GEO_COUNTRY_VERIFIED]: $localize`:@@occurrenceStatus_countryVerified:Country verified`,
  [SubmissionStatus.GEO_REGION_VERIFIED]: $localize`:@@occurrenceStatus_regionVerified:Region verified`,
  [SubmissionStatus.GEO_LOCALITY_VERIFIED]: $localize`:@@occurrenceStatus_localityVerified:Locality verified`,
  [SubmissionStatus.VERIFIED]: $localize`:@@occurrenceStatus_verified:Verified`,
  [SubmissionStatus.REJECTED]: $localize`:@@occurrenceStatus_rejected:Rejected`,
  [SubmissionStatus.DELETED]: $localize`:@@occurrenceStatus_deleted:Deleted`,
  [SubmissionStatus.UNKNOWN]: $localize`:@@occurrenceStatus_unknown:Unknown`,
};

@Component({
  selector: 'occurrence-state-labels',
  imports: [
    IconComponent,
    NgTemplateOutlet,
    ModalComponent,
    OccurrenceValidationIndicatorsComponent,
  ],
  templateUrl: './occurrence-state-labels.component.html',
  styleUrl: './occurrence-state-labels.component.scss',
})
export class OccurrenceStateLabelsComponent {
  readonly occurrence = input.required<Occurrence>();
  readonly hasBackdrop = input(false);
  readonly visibilityChanged = output<void>();

  private readonly modalService = inject(ModalService);
  private readonly userProfileService = inject(UserProfileService);
  protected readonly publicationService = inject(OccurrencePublicationService);
  protected readonly validationService = inject(OccurrenceValidationService);
  protected readonly SubmissionStatus = SubmissionStatus;

  protected readonly isOwner = computed(() => {
    const profileResource = this.userProfileService.profileResource;
    const status = profileResource.status();
    if (status !== 'resolved' && status !== 'local') return false;

    const userId = profileResource.value()?.user?.id;
    const authorId = this.occurrence().author?.id;
    return (
      typeof userId === 'string' &&
      userId.length > 0 &&
      typeof authorId === 'string' &&
      authorId.length > 0 &&
      userId === authorId
    );
  });

  protected readonly canVerify = computed(
    () => this.isOwner() && this.occurrence().status === SubmissionStatus.DRAFT,
  );

  protected readonly visibilityLabel = computed(() =>
    this.occurrence().is_visible
      ? $localize`:@@occurrencePublic:Public`
      : $localize`:@@occurrencePrivate:Private`,
  );
  protected readonly audienceLabel = computed(() => {
    if (this.occurrence().is_visible) {
      return $localize`:@@occurrencePublicAudience:Visible to everyone`;
    }
    return this.isOwner()
      ? $localize`:@@occurrencePrivateAudience:Only visible to you`
      : $localize`:@@occurrencePrivateAudienceOther:Not publicly shared`;
  });

  protected readonly validationModalId = computed(
    () => `occurrence-validation-${this.occurrence().id}`,
  );
  protected readonly visibilityModalId = computed(
    () => `occurrence-visibility-${this.occurrence().id}`,
  );
  protected readonly statusLabel = computed(
    () => STATUS_LABELS[this.occurrence().status],
  );
  protected readonly statusIcon = computed<IconName>(() => {
    switch (this.occurrence().status) {
      case SubmissionStatus.DRAFT:
      case SubmissionStatus.IN_REVIEW:
      case SubmissionStatus.UNKNOWN:
        return 'clock';
      case SubmissionStatus.REJECTED:
      case SubmissionStatus.DELETED:
        return 'cross';
      default:
        return 'check';
    }
  });
  protected readonly isValidationModalOpen = computed(() =>
    this.modalService.isOpen(this.validationModalId()),
  );
  protected readonly isVisibilityModalOpen = computed(() =>
    this.modalService.isOpen(this.visibilityModalId()),
  );

  protected openValidationProgress(): void {
    this.modalService.open(this.validationModalId(), 'compact');
  }

  protected openVisibility(): void {
    this.modalService.open(this.visibilityModalId(), 'compact');
  }

  protected async updateVisibility(): Promise<void> {
    if (!this.isOwner() || this.publicationService.isLoading()) return;

    const occurrence = this.occurrence();
    const succeeded = occurrence.is_visible
      ? await this.publicationService.unpublish(occurrence)
      : await this.publicationService.publish(occurrence);

    if (!succeeded) return;

    this.modalService.close(this.visibilityModalId());
    this.visibilityChanged.emit();
  }

  protected validateOccurrence(): void {
    if (!this.canVerify() || this.validationService.resource.isLoading())
      return;
    this.validationService.validate(this.occurrence());
  }
}
