import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AnimalSearchService } from './animal-search.service';
import { AnimalSearchResponse } from './animal-search.model';
import { provideHttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

describe('AnimalSearchService', () => {
  let service: AnimalSearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AnimalSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when findOccurrences is called and false when complete', (done) => {
    const mockResponse: AnimalSearchResponse = { data: [] };
    expect(service.isLoading()).toBe(false);

    service
      .getOccurrences('test')
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

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/search?q=test&lang=de',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle error', (done) => {
    service.getOccurrences('test').subscribe((res) => {
      expect(res).toEqual({ data: [] });
      expect(service.error()).toBe(
        'Network error: Please check your connection',
      );
      done();
    });

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/search?q=test&lang=de',
    );
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });
});
