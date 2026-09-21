import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedOccurrencesComponent } from './submitted-occurrences.component';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import {
  Occurrence,
  SubmissionStatus,
} from '../../../services/occurrence/occurrence.model';
import { OccurrenceValidationService } from '../../../services/occurrence/occurrence-validation/occurrence-validation.service';
import { OccurrencePublicationService } from '../../../services/occurrence/occurrence-publication/occurrence-publication.service';
import { OccurrenceValidationResponse } from '../../../services/occurrence/occurrence-validation/occurrence-validation.model';

describe('SubmittedOccurrencesComponent', () => {
  let component: SubmittedOccurrencesComponent;
  let fixture: ComponentFixture<SubmittedOccurrencesComponent>;
  const validate = vi.fn();
  const publish = vi.fn();
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
            hasPublishError: () => false,
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

  it('shows a validation button only for draft occurrences', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.validate-button');

    expect(buttons).toHaveLength(1);
    expect(buttons[0].textContent).toContain('Validate');
    expect(buttons[0].querySelector('app-icon[name="check"]')).toBeTruthy();
    expect(buttons[0].classList).toContain('btn-primary');
  });

  it('shows validation indicators in place of the button after draft', () => {
    expect(
      fixture.nativeElement.querySelectorAll(
        'occurrence-validation-indicators',
      ),
    ).toHaveLength(1);
  });

  it.each([
    SubmissionStatus.GEO_CONTINENT_VERIFIED,
    SubmissionStatus.GEO_COUNTRY_VERIFIED,
    SubmissionStatus.GEO_REGION_VERIFIED,
    SubmissionStatus.GEO_LOCALITY_VERIFIED,
    SubmissionStatus.VERIFIED,
  ])(
    'shows a publish button for a private occurrence with status %s',
    (status) => {
      occurrences.set([occurrence('verified-id', status)]);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.publish-button');

      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Publish');
      expect(button.querySelector('app-icon[name="eye-open"]')).toBeTruthy();
      expect(button.classList).toContain('btn-secondary');
      expect(button.classList).not.toContain('btn-primary');
    },
  );

  it('shows public text instead of an action for a published occurrence', () => {
    occurrences.set([
      {
        ...occurrence('public-id', SubmissionStatus.VERIFIED),
        is_visible: true,
      },
    ]);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.publication-state').textContent,
    ).toContain('Public');
    expect(
      fixture.nativeElement.querySelector(
        '.publication-state app-icon[name="eye-open"]',
      ),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.occurrence-item-visibility'),
    ).toBeNull();
    expect(fixture.nativeElement.querySelector('.publish-button')).toBeNull();
  });

  it('delegates validation to the validation service', () => {
    fixture.nativeElement.querySelector('.validate-button').click();

    expect(validate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'draft-id' }),
    );
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
    expect(fixture.nativeElement.querySelector('.publish-button')).toBeTruthy();

    occurrences.set([occurrence('draft-id', SubmissionStatus.NAME_VERIFIED)]);
    occurrencesStatus.set('resolved');
    TestBed.tick();
    fixture.detectChanges();

    expect(clearValidationResult).toHaveBeenCalledOnce();
    expect(clearValidationResult).toHaveBeenCalledWith(undefined);
    expect(fixture.nativeElement.querySelector('.publish-button')).toBeNull();
  });

  it('publishes a verified occurrence and reloads the list', async () => {
    occurrences.set([occurrence('verified-id', SubmissionStatus.VERIFIED)]);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.publish-button').click();

    await vi.waitFor(() => {
      expect(publish).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'verified-id' }),
      );
      expect(reload).toHaveBeenCalledOnce();
    });
  });
});

function occurrence(id: string, status: SubmissionStatus): Occurrence {
  return {
    id,
    author: { nickname: 'Scout', image: '', role: 'user' },
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
