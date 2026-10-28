import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
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
  const routeParams = new BehaviorSubject({ id: 'test-id' });
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
    routeParams.next({ id: 'test-id' });
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
          useValue: { params: routeParams },
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

  it('refetches a previously viewed occurrence when its detail page is reopened', async () => {
    occurrenceValue.set(occurrence());
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.visibility-chip').textContent,
    ).toContain('Private');
    fixture.destroy();
    reload.mockClear();

    fixture = TestBed.createComponent(OccurrenceViewComponent);
    await fixture.whenStable();

    expect(reload).toHaveBeenCalledOnce();

    occurrenceValue.set({ ...occurrence(), is_visible: true });
    occurrenceStatus.set('resolved');
    await fixture.whenStable();

    expect(
      fixture.nativeElement.querySelector('.visibility-chip').textContent,
    ).toContain('Public');
    expect(reload).toHaveBeenCalledOnce();
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

  it('groups the observation identity in one header', () => {
    occurrenceValue.set(occurrence());
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('h1')).toHaveLength(1);
    const header = fixture.nativeElement.querySelector('.occurrence-summary');
    expect(header.querySelector('h1').textContent).toContain('Red fox');
    expect(header.querySelector('time').getAttribute('datetime')).toBe(
      occurrence().observed_at,
    );
    expect(header.querySelector('.observer-byline').textContent).toContain(
      'Scout',
    );
    expect(header.querySelector('.observer-avatar app-icon')).toBeTruthy();
    expect(header.textContent).not.toContain('Field observation');
    expect(fixture.nativeElement.querySelector('footer')).toBeNull();
  });

  it('keeps supporting fields visible in a labelled section', () => {
    occurrenceValue.set(occurrence());
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelector('.observation-details');
    expect(details.querySelector('h2').textContent).toContain(
      'Observation details',
    );
    expect(details.textContent).toContain('Observer confidence');
    expect(details.textContent).toContain('90%');
    expect(details.textContent).toContain('52.52');
    expect(fixture.nativeElement.querySelector('details, summary')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[role="progressbar"]'),
    ).toBeNull();
  });

  it('updates the observation when navigating to another route id', async () => {
    occurrenceValue.set(occurrence());
    await fixture.whenStable();

    routeParams.next({ id: 'next-id' });
    occurrenceValue.set({
      ...occurrence(),
      id: 'next-id',
      submitted_name: 'Badger',
    });
    await fixture.whenStable();

    expect(occurrenceId()).toBe('next-id');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'Badger',
    );
    expect(
      fixture.nativeElement.querySelector('.observation-details').textContent,
    ).toContain('90%');
  });

  it.each(['', '   '])('omits empty observation notes (%j)', (description) => {
    occurrenceValue.set({ ...occurrence(), description });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.occurrence-description'),
    ).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain(
      'No description provided',
    );
  });

  it('preserves paragraphs and uses an image when the observer has one', () => {
    const description = 'Near the forest edge.\n\nCrossed the path.';
    occurrenceValue.set({
      ...occurrence(),
      description,
      author: { ...occurrence().author, image: '/scout.jpg' },
    });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.occurrence-description')
        .textContent,
    ).toBe(description);
    expect(
      fixture.nativeElement
        .querySelector('.observer-avatar img')
        .getAttribute('src'),
    ).toBe('/scout.jpg');
  });

  it('uses readable fallbacks for missing metadata and formats detection values', () => {
    occurrenceValue.set({
      ...occurrence(),
      kingdom: '',
      evidence_type: ' ',
      detection_method: 'human_observation',
    });
    fixture.detectChanges();

    const details = fixture.nativeElement.querySelector('.observation-details');
    expect(details.textContent.match(/Not provided/g)).toHaveLength(2);
    expect(details.textContent).toContain('human observation');
  });

  it('keeps the current observation and controls visible during a refresh', async () => {
    occurrenceValue.set(occurrence());
    await fixture.whenStable();
    isLoading.set(true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'Red fox',
    );
    expect(
      fixture.nativeElement.querySelector('.visibility-chip'),
    ).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.loading-orbit')).toBeNull();
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
