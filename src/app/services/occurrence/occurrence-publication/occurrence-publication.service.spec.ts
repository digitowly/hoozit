import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { Occurrence, SubmissionStatus } from '../occurrence.model';
import { OccurrencePublicationService } from './occurrence-publication.service';

describe('OccurrencePublicationService', () => {
  let http: HttpTestingController;
  let service: OccurrencePublicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(OccurrencePublicationService);
  });

  it.each([
    SubmissionStatus.GEO_CONTINENT_VERIFIED,
    SubmissionStatus.GEO_COUNTRY_VERIFIED,
    SubmissionStatus.GEO_REGION_VERIFIED,
    SubmissionStatus.GEO_LOCALITY_VERIFIED,
    SubmissionStatus.VERIFIED,
  ])('publishes a private occurrence with status %s', async (status) => {
    const result = service.publish({ ...occurrence(), status });

    const request = http.expectOne(
      `${environment.scoutUrl}/user/occurrences/occurrence-id/publish`,
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    expect(request.request.withCredentials).toBe(true);
    request.flush(null);

    await expect(result).resolves.toBe(true);
  });

  it('does not publish an occurrence before geographic verification', async () => {
    await expect(
      service.publish({
        ...occurrence(),
        status: SubmissionStatus.NAME_VERIFIED,
      }),
    ).resolves.toBe(false);

    http.expectNone(
      `${environment.scoutUrl}/user/occurrences/occurrence-id/publish`,
    );
  });

  it('does not publish an occurrence that is already public', async () => {
    await expect(
      service.publish({ ...occurrence(), is_visible: true }),
    ).resolves.toBe(false);

    http.expectNone(
      `${environment.scoutUrl}/user/occurrences/occurrence-id/publish`,
    );
  });

  it('unpublishes a public occurrence', async () => {
    const result = service.unpublish({ ...occurrence(), is_visible: true });

    const request = http.expectOne(
      `${environment.scoutUrl}/user/occurrences/occurrence-id/unpublish`,
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({});
    expect(request.request.withCredentials).toBe(true);
    request.flush(null);

    await expect(result).resolves.toBe(true);
  });

  it('exposes a publish failure for the requested occurrence', async () => {
    const result = service.publish(occurrence());

    http
      .expectOne(
        `${environment.scoutUrl}/user/occurrences/occurrence-id/publish`,
      )
      .flush(null, { status: 500, statusText: 'Server Error' });

    await expect(result).resolves.toBe(false);
    expect(service.hasPublishError('occurrence-id')).toBe(true);
  });
});

function occurrence(): Occurrence {
  return {
    id: 'occurrence-id',
    author: { nickname: 'Scout', image: '', role: 'user' },
    submitted_name: 'Red fox',
    description: 'Seen near the forest edge',
    confidence: 90,
    observed_at: '2026-08-19T08:00:00Z',
    status: SubmissionStatus.VERIFIED,
    is_visible: false,
    kingdom: 'Animalia',
    detection_method: 'visual',
    evidence_type: 'photo',
    coordinates: { latitude: 52.52, longitude: 13.405 },
  };
}
