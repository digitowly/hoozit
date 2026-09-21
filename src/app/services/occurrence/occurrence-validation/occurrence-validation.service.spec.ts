import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Occurrence, SubmissionStatus } from '../occurrence.model';
import { OccurrenceValidationResponse } from './occurrence-validation.model';
import { OccurrenceValidationService } from './occurrence-validation.service';

describe('OccurrenceValidationService', () => {
  let http: HttpTestingController;
  let service: OccurrenceValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(OccurrenceValidationService);
  });

  it('posts a draft occurrence to the Scout validate endpoint', async () => {
    expect(service.validate(occurrence(SubmissionStatus.DRAFT))).toBe(true);
    TestBed.tick();

    const request = http.expectOne(
      `${environment.scoutUrl}/user/occurrence/occurrence-id/validate`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({});
    expect(request.request.withCredentials).toBe(true);

    const response = validationResponse();
    request.flush(response);

    await vi.waitFor(() => expect(service.resource.value()).toEqual(response));
  });

  it('does not validate an occurrence that is not a draft', () => {
    expect(service.validate(occurrence(SubmissionStatus.IN_REVIEW))).toBe(
      false,
    );
    TestBed.tick();

    http.expectNone(
      `${environment.scoutUrl}/user/occurrence/occurrence-id/validate`,
    );
  });

  it('does not start another validation while one is loading', () => {
    expect(service.validate(occurrence(SubmissionStatus.DRAFT))).toBe(true);
    TestBed.tick();

    expect(
      service.validate({
        ...occurrence(SubmissionStatus.DRAFT),
        id: 'another-occurrence',
      }),
    ).toBe(false);

    const request = http.expectOne(
      `${environment.scoutUrl}/user/occurrence/occurrence-id/validate`,
    );
    request.flush(validationResponse());
  });
});

function occurrence(status: SubmissionStatus): Occurrence {
  return {
    id: 'occurrence-id',
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

function validationResponse(): OccurrenceValidationResponse {
  return {
    id: 'occurrence-id',
    status: SubmissionStatus.GEO_LOCALITY_VERIFIED,
    validation: {
      has_specific_name: true,
      has_valid_continent: true,
      has_valid_country: true,
      has_valid_region: true,
      has_valid_locality: true,
    },
  };
}
