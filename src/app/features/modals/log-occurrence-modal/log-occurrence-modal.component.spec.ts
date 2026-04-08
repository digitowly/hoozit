import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { of, Observable } from 'rxjs';

import { LogOccurrenceModalComponent } from './log-occurrence-modal.component';
import { OccurrenceService } from '../../../services/rango/occurrence/occurrence.service';
import { UserLocationService } from '../../../services/user/user-location/user-location.service';
import { UserDataService } from '../../../services/user/user-data/user-data.service';
import { SpeciesAutosuggestService } from '../../../services/forms/species-autosuggest/species-autosuggest.service';
import { ModalService } from '../../../services/modal/modal.service';
import { UserOccurrenceRequest } from '../../../services/rango/occurrence/occurrence.model';

const MODAL_ID = 'test-modal';
const TAWNY_OWL = { label: 'Tawny owl', value: 'Strix aluco', icon: '' };
const MOCK_COORD = { latitude: 53.5511, longitude: 9.9937 };

describe('LogOccurrenceModalComponent', () => {
  let component: LogOccurrenceModalComponent;
  let fixture: ComponentFixture<LogOccurrenceModalComponent>;

  let submissionState: ReturnType<typeof signal<'initial' | 'loading' | 'success' | 'error'>>;
  let userValue: ReturnType<typeof signal<object | null>>;
  let mockOccurrenceService: {
    submissionState: typeof submissionState;
    submit: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
  };
  let mockModalService: {
    isOpen: ReturnType<typeof vi.fn>;
    open: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };
  let mockSpeciesAutosuggestService: {
    speciesEntries: ReturnType<typeof signal<never[]>>;
    onChange: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    }));

    submissionState = signal<'initial' | 'loading' | 'success' | 'error'>('initial');
    userValue = signal<object | null>(null);

    mockOccurrenceService = {
      submissionState,
      submit: vi.fn().mockReturnValue(of(undefined)),
      reset: vi.fn(),
    };

    mockModalService = {
      isOpen: vi.fn().mockReturnValue(false),
      open: vi.fn(),
      close: vi.fn(),
    };

    mockSpeciesAutosuggestService = {
      speciesEntries: signal([]),
      onChange: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LogOccurrenceModalComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClientTesting(),
        { provide: OccurrenceService, useValue: mockOccurrenceService },
        {
          provide: UserLocationService,
          useValue: { coordinate: signal(MOCK_COORD) },
        },
        {
          provide: UserDataService,
          useValue: { userResource: { value: userValue } },
        },
        { provide: SpeciesAutosuggestService, useValue: mockSpeciesAutosuggestService },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LogOccurrenceModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('modalId', MODAL_ID);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isSubmittable', () => {
    it('is false initially', () => {
      expect(component.isSubmittable()).toBe(false);
    });

    it('is false when not logged in even with name and description filled', () => {
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');
      expect(component.isSubmittable()).toBe(false);
    });

    it('is false when logged in but name is empty', () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.description().value.set('Saw it at night.');
      expect(component.isSubmittable()).toBe(false);
    });

    it('is false when logged in but description is empty', () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      expect(component.isSubmittable()).toBe(false);
    });

    it('is true when logged in with name and description filled', () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');
      expect(component.isSubmittable()).toBe(true);
    });

    it('is false while state is loading', () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');
      submissionState.set('loading');
      expect(component.isSubmittable()).toBe(false);
    });

    it('is false while state is success', () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');
      submissionState.set('success');
      expect(component.isSubmittable()).toBe(false);
    });

    it('is true when state is error (allows retry)', () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');
      submissionState.set('error');
      expect(component.isSubmittable()).toBe(true);
    });
  });

  describe('locationLabel', () => {
    it('formats coordinates to 4 decimal places', () => {
      expect(component.locationLabel()).toBe('53.5511, 9.9937');
    });
  });

  describe('confidenceLabel', () => {
    it('shows 50% by default', () => {
      expect(component.confidenceLabel()).toBe('50%');
    });

    it('updates when confidence changes', () => {
      component.confidence.set(0.75);
      expect(component.confidenceLabel()).toBe('75%');
    });
  });

  describe('setConfidence', () => {
    it('updates confidence from an input event', () => {
      const event = { target: { value: '0.8' } } as unknown as Event;
      component.setConfidence(event);
      expect(component.confidence()).toBe(0.8);
    });
  });

  describe('setDate', () => {
    it('updates observationDate from an input event', () => {
      const event = { target: { value: '2026-04-08' } } as unknown as Event;
      component.setDate(event);
      expect(component.observationDate()).toBe('2026-04-08');
    });
  });

  describe('setTimeStart', () => {
    it('updates timeStart from an input event', () => {
      const event = { target: { value: '09:30' } } as unknown as Event;
      component.setTimeStart(event);
      expect(component.timeStart()).toBe('09:30');
    });
  });

  describe('setTimeEnd', () => {
    it('updates timeEnd from an input event', () => {
      const event = { target: { value: '10:00' } } as unknown as Event;
      component.setTimeEnd(event);
      expect(component.timeEnd()).toBe('10:00');
    });
  });

  describe('onAutoSuggestChange', () => {
    it('delegates to speciesAutosuggestService.onChange', () => {
      component.onAutoSuggestChange('owl');
      expect(mockSpeciesAutosuggestService.onChange).toHaveBeenCalledWith('owl');
    });

    it('updates the form name field', () => {
      component.onAutoSuggestChange('owl');
      expect(component.occurrenceForm.name().value()).toBe('owl');
    });
  });

  describe('onAutoSuggestSelect', () => {
    it('sets the form name to the entry label', () => {
      component.onAutoSuggestSelect(TAWNY_OWL);
      expect(component.occurrenceForm.name().value()).toBe('Tawny owl');
    });
  });

  describe('onSubmit', () => {
    it('does nothing when the form is not submittable', async () => {
      await component.onSubmit();
      expect(mockOccurrenceService.submit).not.toHaveBeenCalled();
    });

    it('calls submit with the correct name, description, confidence, and coordinates', async () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');
      component.confidence.set(0.9);

      await component.onSubmit();

      expect(mockOccurrenceService.submit).toHaveBeenCalledWith(
        expect.objectContaining<Partial<UserOccurrenceRequest>>({
          name: 'Tawny owl',
          description: 'Saw it at night.',
          confidence: 0.9,
          coordinates: { latitude: MOCK_COORD.latitude, longitude: MOCK_COORD.longitude },
        }),
      );
    });

    it('sends date, time_start and time_end as ISO strings derived from form values', async () => {
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');
      component.observationDate.set('2026-04-08');
      component.timeStart.set('20:00');
      component.timeEnd.set('20:15');

      await component.onSubmit();

      const payload = mockOccurrenceService.submit.mock.calls[0][0] as UserOccurrenceRequest;
      expect(payload.date).toBe(new Date('2026-04-08T20:00:00').toISOString());
      expect(payload.time_start).toBe(new Date('2026-04-08T20:00:00').toISOString());
      expect(payload.time_end).toBe(new Date('2026-04-08T20:15:00').toISOString());
    });

    it('schedules close after 1500 ms on success', async () => {
      vi.useFakeTimers();
      try {
        userValue.set({ nickname: 'user' });
        component.occurrenceForm.name().value.set('Tawny owl');
        component.occurrenceForm.description().value.set('Saw it at night.');

        await component.onSubmit();

        expect(mockModalService.close).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1500);
        expect(mockModalService.close).toHaveBeenCalledWith(MODAL_ID);
      } finally {
        vi.useRealTimers();
      }
    });

    it('does not propagate errors when the service observable errors', async () => {
      mockOccurrenceService.submit.mockReturnValue(
        new Observable((s) => s.error(new Error('network error'))),
      );
      userValue.set({ nickname: 'user' });
      component.occurrenceForm.name().value.set('Tawny owl');
      component.occurrenceForm.description().value.set('Saw it at night.');

      await expect(component.onSubmit()).resolves.toBeUndefined();
    });
  });

  describe('close', () => {
    it('closes the modal via ModalService', () => {
      component.close();
      expect(mockModalService.close).toHaveBeenCalledWith(MODAL_ID);
    });

    it('emits the handleClose output', () => {
      const emitSpy = vi.spyOn(component.handleClose, 'emit');
      component.close();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('calls occurrenceService.reset', () => {
      component.close();
      expect(mockOccurrenceService.reset).toHaveBeenCalled();
    });

    it('clears the name field', () => {
      component.occurrenceForm.name().value.set('Tawny owl');
      component.close();
      expect(component.occurrenceForm.name().value()).toBe('');
    });

    it('clears the description field', () => {
      component.occurrenceForm.description().value.set('Saw it at night.');
      component.close();
      expect(component.occurrenceForm.description().value()).toBe('');
    });

    it('resets confidence to 0.5', () => {
      component.confidence.set(0.9);
      component.close();
      expect(component.confidence()).toBe(0.5);
    });

    it('resets observationDate to today', () => {
      const today = new Date().toISOString().slice(0, 10);
      component.observationDate.set('2020-01-01');
      component.close();
      expect(component.observationDate()).toBe(today);
    });

    it('resets timeStart to a valid HH:MM string', () => {
      component.timeStart.set('00:00');
      component.close();
      expect(component.timeStart()).toMatch(/^\d{2}:\d{2}$/);
    });

    it('resets timeEnd to a valid HH:MM string', () => {
      component.timeEnd.set('00:00');
      component.close();
      expect(component.timeEnd()).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});
