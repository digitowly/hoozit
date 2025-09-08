import { TestBed } from '@angular/core/testing';

import { VerdexService } from './verdex.service';

describe('VerdexService', () => {
  let service: VerdexService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerdexService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
