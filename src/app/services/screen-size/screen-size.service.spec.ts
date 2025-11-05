import { TestBed, fakeAsync } from '@angular/core/testing';
import { ScreenSize, ScreenSizeService } from './screen-size.service';

describe('ScreenSizeService', () => {
  let service: ScreenSizeService;
  let innerWidth: number;

  beforeEach(() => {
    spyOnProperty(window, 'innerWidth', 'get').and.callFake(() => innerWidth);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ScreenSizeService);
  });

  function resizeTo(width: number) {
    innerWidth = width;
  }

  it('should be created and initialize immediately', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize size based on current window width', fakeAsync(() => {
    resizeTo(500);
    service.handleResize();
    expect(service.size()).toBe(ScreenSize.SMALL);

    resizeTo(900);
    service.handleResize();
    expect(service.size()).toBe(ScreenSize.MEDIUM);

    resizeTo(1400);
    service.handleResize();
    expect(service.size()).toBe(ScreenSize.LARGE);
  }));
});
