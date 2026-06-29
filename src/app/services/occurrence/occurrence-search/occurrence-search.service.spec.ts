import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OccurrenceSearchService } from './occurrence-search.service';
import {
  OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  OccurrenceSearchResponse,
} from './occurrence-search.model';

describe('OccurrenceSearchService', () => {
  let service: OccurrenceSearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(OccurrenceSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts the requested location, radius level, and taxon keys to Scout', () => {
    const response: OccurrenceSearchResponse = { total: 0, results: [] };

    service
      .search({ latitude: 48.8566, longitude: 2.3522 }, ['1', '2'], 5)
      .subscribe();

    const request = httpMock.expectOne(
      'http://localhost:8080/occurrences/search',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.body).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
      radius_level: 5,
      taxon_keys: ['1', '2'],
    });
    request.flush(response);
  });

  it('uses the default Scout radius level when none is supplied', () => {
    const response: OccurrenceSearchResponse = { total: 0, results: [] };

    service.search({ latitude: 48.8566, longitude: 2.3522 }, ['1']).subscribe();

    const request = httpMock.expectOne(
      'http://localhost:8080/occurrences/search',
    );
    expect(request.request.body.radius_level).toBe(
      OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
    );
    request.flush(response);
  });

  it('returns null and records an error when Scout rejects the search', () => {
    service
      .search({ latitude: 0, longitude: 0 }, ['1'])
      .subscribe((response) => {
        expect(response).toBeNull();
      });

    const request = httpMock.expectOne(
      'http://localhost:8080/occurrences/search',
    );
    request.flush('Invalid request', {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(service.error()).toBe('Client error: Invalid request');
    expect(service.isLoading()).toBe(false);
  });
});
