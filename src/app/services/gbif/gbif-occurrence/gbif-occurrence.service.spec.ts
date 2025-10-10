import { TestBed } from '@angular/core/testing';
import { GbifOccurrenceService } from './gbif-occurrence.service';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

describe('GbifOccurrenceService', () => {
  let service: GbifOccurrenceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GbifOccurrenceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when getOccurrences is called and false when complete', (done) => {
    const mockResponse = {
      results: [],
      limit: 300,
      offset: 0,
      endOfRecords: true,
      count: 0,
    };
    expect(service.isLoading()).toBe(false);

    service
      .search('1', { latitude: 0, longitude: 0 })
      .pipe(
        finalize(() => {
          expect(service.isLoading()).toBe(false);
          done();
        }),
      )
      .subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne((request) =>
      request.url.startsWith('https://api.gbif.org/v1/occurrence/search'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error', (done) => {
    expect(service.error()).toBeNull();

    service
      .search('1', { latitude: 0, longitude: 0 })
      .pipe(
        finalize(() => {
          expect(service.isLoading()).toBe(false);
          expect(service.error()).toBe('Server error: Please try again later');
          done();
        }),
      )
      .subscribe((res) => {
        expect(res).toBeNull();
      });

    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne((request) =>
      request.url.startsWith('https://api.gbif.org/v1/occurrence/search'),
    );
    expect(req.request.method).toBe('GET');
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
