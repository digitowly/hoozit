import { describe, beforeEach, it, expect, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GbifSpeciesService } from './gbif-species.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GbifSpecies } from './gbif-species.model';
import { finalize } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';

describe('GbifSpeciesService', () => {
  let service: GbifSpeciesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(GbifSpeciesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when getSpecies is called and false when complete', () => {
    const mockResponse: GbifSpecies = {
      usage: {
        key: '1',
        canonicalName: 'Test Species',
        name: 'Test Species Name',
      },
      diagnostics: {
        matchType: 'EXACT',
        confidence: 100,
      },
    };
    expect(service.isLoading()).toBe(false);

    service
      .get(1)
      .pipe(
        finalize(() => {
          expect(service.isLoading()).toBe(false);
        }),
      )
      .subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne('https://api.gbif.org/v1/species/match/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error', () => {
    service.get(1).subscribe((res) => {
      expect(res).toBeNull();
      expect(service.error()).toBe(
        'Network error: Please check your connection',
      );
    });

    const req = httpMock.expectOne('https://api.gbif.org/v1/species/match/1');
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });
});
