import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { VerdexService } from './verdex.service';
import { OccurrenceResponse } from '../../model/occurrence';
import { provideHttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';

describe('VerdexService', () => {
  let service: VerdexService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VerdexService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when findOccurrences is called and false when complete', (done) => {
    const mockResponse: OccurrenceResponse = { data: [] };
    expect(service.isLoading()).toBe(false);

    service
      .getOccurrences('test')
      .pipe(
        finalize(() => {
          expect(service.isLoading()).toBe(false);
          done();
        })
      )
      .subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

    expect(service.isLoading()).toBe(true);

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/search?q=test&lang=de'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle network error', (done) => {
    service.getOccurrences('test').subscribe((res) => {
      expect(res).toEqual({ data: [] });
      expect(service.error()).toBe(
        'Network error: Please check your connection'
      );
      done();
    });

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/search?q=test&lang=de'
    );
    req.error(new ProgressEvent('Network error'), { status: 0 });
  });

  it('should handle client error', (done) => {
    service.getOccurrences('test').subscribe((res) => {
      expect(res).toEqual({ data: [] });
      expect(service.error()).toBe('Client error: Invalid request');
      done();
    });

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/search?q=test&lang=de'
    );
    req.flush({}, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle server error', (done) => {
    service.getOccurrences('test').subscribe((res) => {
      expect(res).toEqual({ data: [] });
      expect(service.error()).toBe('Server error: Please try again later');
      done();
    });

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/search?q=test&lang=de'
    );
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should handle other errors', (done) => {
    service.getOccurrences('test').subscribe((res) => {
      expect(res).toEqual({ data: [] });
      expect(service.error()).toBe('Services is currently unavailable');
      done();
    });

    const req = httpMock.expectOne(
      'http://localhost:8082/api/animals/search?q=test&lang=de'
    );
    req.flush({}, { status: 300, statusText: 'Multiple Choices' });
  });
});
