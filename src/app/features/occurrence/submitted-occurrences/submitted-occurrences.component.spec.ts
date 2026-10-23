import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { SubmittedOccurrencesComponent } from './submitted-occurrences.component';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import {
  Occurrence,
  SubmissionStatus,
} from '../../../services/occurrence/occurrence.model';
import { OccurrenceValidationService } from '../../../services/occurrence/occurrence-validation/occurrence-validation.service';
import { OccurrencePublicationService } from '../../../services/occurrence/occurrence-publication/occurrence-publication.service';
import { OccurrenceValidationResponse } from '../../../services/occurrence/occurrence-validation/occurrence-validation.model';
import { ModalService } from '../../../services/modal/modal.service';
import { OccurrenceStateLabelsComponent } from '../components/occurrence-state-labels/occurrence-state-labels.component';
import { UserProfileService } from '../../../services/user/user-data/user-profile.service';

describe('SubmittedOccurrencesComponent', () => {
  let component: SubmittedOccurrencesComponent;
  let fixture: ComponentFixture<SubmittedOccurrencesComponent>;
  const validate = vi.fn();
  const publish = vi.fn();
  const unpublish = vi.fn();
  const reload = vi.fn();
  const clearValidationResult = vi.fn();
  const validationStatus = signal<
    'idle' | 'error' | 'loading' | 'reloading' | 'resolved' | 'local'
  >('idle');
  const occurrencesStatus = signal<
    'idle' | 'error' | 'loading' | 'reloading' | 'resolved' | 'local'
  >('resolved');
  const validationValue = signal<OccurrenceValidationResponse | undefined>(
    undefined,
  );
  const occurrences = signal<Occurrence[]>([]);
  const publicationLoading = signal(false);

  beforeEach(async () => {
    validate.mockReset();
    publish.mockReset();
    publish.mockResolvedValue(true);
    unpublish.mockReset();
    unpublish.mockResolvedValue(true);
    reload.mockReset();
    reload.mockImplementation(() => {
      occurrencesStatus.set('reloading');
      return true;
    });
    clearValidationResult.mockReset();
    clearValidationResult.mockImplementation(
      (result: OccurrenceValidationResponse | undefined) => {
        validationValue.set(result);
        validationStatus.set('local');
      },
    );
    validationStatus.set('idle');
    occurrencesStatus.set('resolved');
    validationValue.set(undefined);
    publicationLoading.set(false);
    occurrences.set([
      occurrence('draft-id', SubmissionStatus.DRAFT),
      occurrence('review-id', SubmissionStatus.IN_REVIEW),
    ]);

    await TestBed.configureTestingModule({
      imports: [SubmittedOccurrencesComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserProfileService,
          useValue: { profileResource: { status: signal('idle') } },
        },
        {
          provide: UserOccurrencesService,
          useValue: {
            resource: {
              value: occurrences,
              status: occurrencesStatus,
              reload,
            },
          },
        },
        {
          provide: OccurrenceValidationService,
          useValue: {
            resource: {
              value: validationValue,
              status: validationStatus,
              isLoading: signal(false),
              set: clearValidationResult,
            },
            validate,
            isValidating: () => false,
            hasError: () => false,
          },
        },
        {
          provide: OccurrencePublicationService,
          useValue: {
            isLoading: publicationLoading,
            publish,
            unpublish,
            canPublish: (occurrence: Occurrence) => {
              const publishableStatuses = new Set<SubmissionStatus>([
                SubmissionStatus.GEO_CONTINENT_VERIFIED,
                SubmissionStatus.GEO_COUNTRY_VERIFIED,
                SubmissionStatus.GEO_REGION_VERIFIED,
                SubmissionStatus.GEO_LOCALITY_VERIFIED,
                SubmissionStatus.VERIFIED,
              ]);

              return (
                !occurrence.is_visible &&
                publishableStatuses.has(occurrence.status)
              );
            },
            isPublishing: () => false,
            isUnpublishing: () => false,
            hasPublishError: () => false,
            hasUnpublishError: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmittedOccurrencesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps confidence and validation actions out of the card body', () => {
    expect(
      fixture.nativeElement.querySelector('.occurrence-item-confidence'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.validate-button')).toBeNull();
  });

  it('links every occurrence to its detail page', () => {
    const links = fixture.nativeElement.querySelectorAll(
      '.occurrence-detail-link',
    );

    expect(links).toHaveLength(2);
    expect(links[0].getAttribute('href')).toBe('/user/occurrence/draft-id');
    expect(links[1].getAttribute('href')).toBe('/user/occurrence/review-id');
  });

  it('shows the same state capsules for every occurrence', () => {
    expect(
      fixture.nativeElement.querySelectorAll('occurrence-state-labels'),
    ).toHaveLength(2);
    expect(
      fixture.nativeElement.querySelectorAll('.status-chip')[0].textContent,
    ).toContain('Draft');
    expect(
      fixture.nativeElement.querySelectorAll('.status-chip')[1].textContent,
    ).toContain('In review');
    expect(
      fixture.nativeElement.querySelector('occurrence-validation-indicators'),
    ).toBeNull();
  });

  it('opens the validation progress modal from a status capsule', () => {
    fixture.nativeElement.querySelectorAll('.status-chip')[1].click();

    expect(
      TestBed.inject(ModalService).isOpen('occurrence-validation-review-id'),
    ).toBe(true);
  });

  it('keeps publication actions out of the card body', () => {
    occurrences.set([
      occurrence('verified-id', SubmissionStatus.GEO_REGION_VERIFIED),
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.publish-button')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.visibility-chip'),
    ).toBeTruthy();
  });

  it('shows public state without a publication action', () => {
    occurrences.set([
      {
        ...occurrence('public-id', SubmissionStatus.VERIFIED),
        is_visible: true,
      },
    ]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.visibility-chip').textContent,
    ).toContain('Public');
    expect(
      fixture.nativeElement.querySelector('.visibility-chip app-icon'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.occurrence-item-visibility'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.publish-button')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.occurrence-action-row'),
    ).toBeNull();
  });

  it('reloads occurrences after validation resolves', () => {
    validationStatus.set('resolved');
    TestBed.tick();

    expect(reload).toHaveBeenCalledOnce();
  });

  it('clears the validation result after the occurrence reload resolves', () => {
    occurrences.set([occurrence('draft-id', SubmissionStatus.DRAFT)]);
    validationValue.set(validationResponse('draft-id'));
    validationStatus.set('resolved');
    TestBed.tick();
    fixture.detectChanges();

    expect(reload).toHaveBeenCalledOnce();
    expect(clearValidationResult).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('.status-chip').textContent,
    ).toContain('Continent verified');

    occurrences.set([occurrence('draft-id', SubmissionStatus.NAME_VERIFIED)]);
    occurrencesStatus.set('resolved');
    TestBed.tick();
    fixture.detectChanges();

    expect(clearValidationResult).toHaveBeenCalledOnce();
    expect(clearValidationResult).toHaveBeenCalledWith(undefined);
    expect(
      fixture.nativeElement.querySelector('.status-chip').textContent,
    ).toContain('Name verified');
  });

  it('reloads the list after visibility changes', () => {
    occurrences.set([occurrence('verified-id', SubmissionStatus.VERIFIED)]);
    fixture.detectChanges();
    reload.mockClear();

    const labels = fixture.debugElement.query(
      By.directive(OccurrenceStateLabelsComponent),
    ).componentInstance as OccurrenceStateLabelsComponent;
    labels.visibilityChanged.emit();

    expect(reload).toHaveBeenCalledOnce();
  });
});

function occurrence(id: string, status: SubmissionStatus): Occurrence {
  return {
    id,
    author: { id: 'scout-id', nickname: 'Scout', image: '', role: 'user' },
    submitted_name: 'Red fox',
    description: 'Seen near the forest edge',
    confidence: 90,
    observed_at: '2026-08-19T08:00:00Z',
    status,
    is_visible: false,
    kingdom: 'Animalia',
    detection_method: 'visual',
    evidence_type: 'photo',
    coordinates: { latitude: 52.52, longitude: 13.405 },
  };
}

function validationResponse(id: string): OccurrenceValidationResponse {
  return {
    id,
    status: SubmissionStatus.GEO_CONTINENT_VERIFIED,
    validation: {
      has_specific_name: true,
      has_valid_continent: true,
      has_valid_country: null,
      has_valid_region: null,
      has_valid_locality: null,
    },
  };
}
