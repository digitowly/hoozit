import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SpeciesContentService } from './species-content.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AnimalSearchResponse } from '../animal-search/animal-search.model';
import { finalize } from 'rxjs';

describe('SpeciesContentService', () => {
  let service: SpeciesContentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SpeciesContentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when findOccurrences is called and false when complete', () => {
    const mockResponse: AnimalSearchResponse = { data: [] };
    expect(service.isLoading()).toBe(false);

    service
      .getIntroduction(42)
      .pipe(
        finalize(() => {
          expect(service.isLoading()).toBe(false);
        }),
      )
      .subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/42/content/introduction?lang=de',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error', () => {
    service.getIntroduction(42).subscribe((res) => {
      expect(res).toEqual({ data: [] });
      expect(service.error()).toBe(
        'Network error: Please check your connection',
      );
    });

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/42/content/introduction?lang=de',
    );
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });
});
