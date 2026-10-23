import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OccurrenceViewComponent } from './occurrence-view.component';
import { UserOccurrenceService } from '../../../services/occurrence/user-occurrences/user-occurrence.service';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';
import {
  Occurrence,
  SubmissionStatus,
} from '../../../services/occurrence/occurrence.model';
import { OccurrencePublicationService } from '../../../services/occurrence/occurrence-publication/occurrence-publication.service';
import { OccurrenceValidationService } from '../../../services/occurrence/occurrence-validation/occurrence-validation.service';
import { OccurrenceValidationResponse } from '../../../services/occurrence/occurrence-validation/occurrence-validation.model';
import { OccurrenceStateLabelsComponent } from '../components/occurrence-state-labels/occurrence-state-labels.component';
import { UserProfileService } from '../../../services/user/user-data/user-profile.service';

describe('OccurrenceViewComponent', () => {
  let component: OccurrenceViewComponent;
  let fixture: ComponentFixture<OccurrenceViewComponent>;
  const occurrenceValue = signal<Occurrence | undefined>(undefined);
  const isLoading = signal(false);
  const occurrenceId = signal('');
  const reload = vi.fn();
  const reloadOccurrences = vi.fn();
  const occurrenceStatus = signal<
    'idle' | 'error' | 'loading' | 'reloading' | 'resolved' | 'local'
  >('resolved');
  const validationStatus = signal<
    'idle' | 'error' | 'loading' | 'reloading' | 'resolved' | 'local'
  >('idle');
  const validationValue = signal<OccurrenceValidationResponse | undefined>(
    undefined,
  );
  const clearValidationResult = vi.fn();

  beforeEach(async () => {
    occurrenceValue.set(undefined);
    isLoading.set(false);
    occurrenceId.set('');
    reload.mockReset();
    reloadOccurrences.mockReset();
    reload.mockImplementation(() => {
      occurrenceStatus.set('reloading');
      return true;
    });
    occurrenceStatus.set('resolved');
    validationStatus.set('idle');
    validationValue.set(undefined);
    clearValidationResult.mockReset();
    clearValidationResult.mockImplementation(
      (result: OccurrenceValidationResponse | undefined) => {
        validationValue.set(result);
        validationStatus.set('local');
      },
    );

    await TestBed.configureTestingModule({
      imports: [OccurrenceViewComponent],
      providers: [
        {
          provide: UserProfileService,
          useValue: { profileResource: { status: signal('idle') } },
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 'test-id' }) },
        },
        {
          provide: UserOccurrenceService,
          useValue: {
            id: occurrenceId,
            resource: {
              value: occurrenceValue,
              isLoading,
              status: occurrenceStatus,
              reload,
            },
          },
        },
        {
          provide: UserOccurrencesService,
          useValue: { resource: { reload: reloadOccurrences } },
        },
        {
          provide: OccurrencePublicationService,
          useValue: {
            isLoading: signal(false),
            publish: vi.fn(),
            unpublish: vi.fn(),
            canPublish: () => true,
            isPublishing: () => false,
            isUnpublishing: () => false,
            hasPublishError: () => false,
            hasUnpublishError: () => false,
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
            validate: vi.fn(),
            isValidating: () => false,
            hasError: () => false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the occurrence from the route id', () => {
    expect(occurrenceId()).toBe('test-id');
  });

  it('renders the occurrence details', () => {
    occurrenceValue.set(occurrence());
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Red fox');
    expect(text).toContain('Seen near the forest edge');
    expect(text).toContain('90%');
    expect(text).toContain('visual');
    expect(text).toContain('52.52');
    expect(text).toContain('Scout');
    expect(
      fixture.nativeElement.querySelector('occurrence-location-map'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('.visibility-chip').textContent,
    ).toContain('Private');
    expect(
      fixture.nativeElement.querySelector('.status-chip').textContent,
    ).toContain('Country verified');
  });

  it('shows a loading state while the occurrence is loading', () => {
    isLoading.set(true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('[role="status"]').textContent,
    ).toContain('Loading occurrence');
  });

  it('shows an empty state when the occurrence is unavailable', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Occurrence not found');
  });

  it('reloads the occurrence and list after visibility changes', () => {
    occurrenceValue.set(occurrence());
    fixture.detectChanges();

    const labels = fixture.debugElement.query(
      By.directive(OccurrenceStateLabelsComponent),
    ).componentInstance as OccurrenceStateLabelsComponent;
    labels.visibilityChanged.emit();

    expect(reload).toHaveBeenCalledOnce();
    expect(reloadOccurrences).toHaveBeenCalledOnce();
  });

  it('reloads and clears the result after validation completes', () => {
    occurrenceValue.set({
      ...occurrence(),
      status: SubmissionStatus.DRAFT,
    });
    validationValue.set(validationResponse());
    validationStatus.set('resolved');
    TestBed.tick();
    fixture.detectChanges();

    expect(reload).toHaveBeenCalledOnce();
    expect(
      fixture.nativeElement.querySelector('.status-chip').textContent,
    ).toContain('Region verified');

    occurrenceStatus.set('resolved');
    TestBed.tick();

    expect(clearValidationResult).toHaveBeenCalledWith(undefined);
  });
});

function occurrence(): Occurrence {
  return {
    id: 'test-id',
    author: { id: 'scout-id', nickname: 'Scout', image: '', role: 'user' },
    submitted_name: 'Red fox',
    description: 'Seen near the forest edge',
    confidence: 0.9,
    observed_at: '2026-08-19T08:00:00Z',
    status: SubmissionStatus.GEO_COUNTRY_VERIFIED,
    is_visible: false,
    kingdom: 'Animalia',
    detection_method: 'visual',
    evidence_type: 'photo',
    coordinates: { latitude: 52.52, longitude: 13.405 },
  };
}

function validationResponse(): OccurrenceValidationResponse {
  return {
    id: 'test-id',
    status: SubmissionStatus.GEO_REGION_VERIFIED,
    validation: {
      has_specific_name: true,
      has_valid_continent: true,
      has_valid_country: true,
      has_valid_region: true,
      has_valid_locality: null,
    },
  };
}
