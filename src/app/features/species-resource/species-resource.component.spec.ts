import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

import { SpeciesResourceComponent } from './species-resource.component';
import { SpeciesResourceService } from './service/species-resource.service';

const TAWNY_OWL = { label: 'Tawny owl', value: 'Strix aluco', icon: '' };
const IMAGE_URL = 'https://example.com/owl.jpg';

describe('SpeciesResourceComponent', () => {
  let component: SpeciesResourceComponent;
  let fixture: ComponentFixture<SpeciesResourceComponent>;
  let mockSpeciesResourceService: { createOccurrenceResource: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    }));

    mockSpeciesResourceService = {
      createOccurrenceResource: vi.fn().mockReturnValue(of(null)),
    };

    await TestBed.configureTestingModule({
      imports: [SpeciesResourceComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClientTesting(),
        { provide: SpeciesResourceService, useValue: mockSpeciesResourceService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeciesResourceComponent);
    component = fixture.componentInstance;
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

    it('is false with only a species selected', () => {
      component.onAutoSuggestSelect(TAWNY_OWL);
      expect(component.isSubmittable()).toBe(false);
    });

    it('is false with only a URL entered', () => {
      component.speciesResourceForm.url().value.set(IMAGE_URL);
      expect(component.isSubmittable()).toBe(false);
    });

    it('is true after selecting a species and entering a URL', () => {
      component.onAutoSuggestSelect(TAWNY_OWL);
      component.speciesResourceForm.url().value.set(IMAGE_URL);
      expect(component.isSubmittable()).toBe(true);
    });

    it('is false when the selected entry has an empty binomial name', () => {
      component.onAutoSuggestSelect({ label: 'Unknown', value: '', icon: '' });
      component.speciesResourceForm.url().value.set(IMAGE_URL);
      expect(component.isSubmittable()).toBe(false);
    });

    it('is false while submission is loading', () => {
      component.onAutoSuggestSelect(TAWNY_OWL);
      component.speciesResourceForm.url().value.set(IMAGE_URL);
      component.submissionState.set('loading');
      expect(component.isSubmittable()).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('sets error state when the form is not submittable', async () => {
      await component.onSubmit();
      expect(component.submissionState()).toBe('error');
      expect(mockSpeciesResourceService.createOccurrenceResource).not.toHaveBeenCalled();
    });

    it('calls createOccurrenceResource with the selected binomial name and URL', async () => {
      component.onAutoSuggestSelect(TAWNY_OWL);
      component.speciesResourceForm.url().value.set(IMAGE_URL);

      await component.onSubmit();

      expect(mockSpeciesResourceService.createOccurrenceResource).toHaveBeenCalledWith(
        expect.objectContaining({
          binomial_name: 'Strix aluco',
          url: IMAGE_URL,
        }),
      );
    });

    it('sets success state after a successful submission', async () => {
      component.onAutoSuggestSelect(TAWNY_OWL);
      component.speciesResourceForm.url().value.set(IMAGE_URL);

      await component.onSubmit();

      expect(component.submissionState()).toBe('success');
    });

    it('clears the URL field after a successful submission', async () => {
      component.onAutoSuggestSelect(TAWNY_OWL);
      component.speciesResourceForm.url().value.set(IMAGE_URL);

      await component.onSubmit();

      expect(component.speciesResourceForm.url().value()).toBe('');
    });

    it('sets error state when the service throws', async () => {
      mockSpeciesResourceService.createOccurrenceResource.mockReturnValue(
        new (await import('rxjs')).Observable((s) => s.error(new Error('server error'))),
      );
      component.onAutoSuggestSelect(TAWNY_OWL);
      component.speciesResourceForm.url().value.set(IMAGE_URL);

      await component.onSubmit();

      expect(component.submissionState()).toBe('error');
    });
  });
});
