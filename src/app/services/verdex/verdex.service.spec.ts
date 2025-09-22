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
});
