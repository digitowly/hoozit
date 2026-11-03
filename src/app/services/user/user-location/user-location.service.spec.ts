import { TestBed } from '@angular/core/testing';
import { UserLocationService } from './user-location.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UserLocationService', () => {
  let service: UserLocationService;

  // Create a mock object for geolocation
  const mockGeolocation = {
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
    getCurrentPosition: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    // Inject our mock into the global window/navigator object
    Object.defineProperty(window.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [UserLocationService],
    });
    service = TestBed.inject(UserLocationService);

    vi.resetAllMocks();
  });

  afterEach(() => {
    service.ngOnDestroy();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update coordinate and become valid on success', () => {
    const mockPosition = {
      coords: {
        latitude: 12.34,
        longitude: 56.78,
      },
    };

    // Mock watchPosition to immediately call the success callback
    mockGeolocation.watchPosition.mockImplementation((success) => {
      success(mockPosition);
      return 100; // fake watchId
    });

    service.getLocation();

    expect(mockGeolocation.watchPosition).toHaveBeenCalled();
    expect(service.coordinate()).toEqual({
      latitude: 12.34,
      longitude: 56.78,
    });
    expect(service.hasResolved()).toBe(true);
    expect(service.isValid()).toBe(true);
  });

  it('should set error state when geolocation fails', () => {
    // Mock watchPosition to immediately call the error callback
    mockGeolocation.watchPosition.mockImplementation((_, error) => {
      if (error) error({ code: 1, message: 'User denied' } as any);
      return 100;
    });

    service.getLocation();

    expect(service.hasResolved()).toBe(true);
    expect(service.isValid()).toBe(false);
  });

  it('should not start a second watcher if one is already active', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);

    // First call
    service.getLocation();
    // Second call
    service.getLocation();

    expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(1);
  });
  it('starts without fabricated coordinates', () => {
    expect(service.coordinate()).toBeNull();
    expect(service.isValid()).toBe(false);
    expect(service.hasResolved()).toBe(false);
  });

  it('resolves unsupported browsers to an actionable error', () => {
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      writable: true,
    });
    service.getLocation();
    expect(service.error()).toBe('unsupported');
    expect(service.hasResolved()).toBe(true);
    expect(service.isLoading()).toBe(false);
  });

  it.each([
    [1, 'denied'],
    [2, 'unavailable'],
    [3, 'timeout'],
  ])('handles a previous fix on error %s', (code, reason) => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [success, failure] = mockGeolocation.watchPosition.mock.calls[0];
    success({ coords: { latitude: 52, longitude: 13 } });
    failure({ code });
    expect(service.coordinate()).toEqual(
      code === 1 ? null : { latitude: 52, longitude: 13 },
    );
    expect(service.isValid()).toBe(false);
    expect(service.error()).toBe(reason);
    expect(service.isLoading()).toBe(false);
  });

  it('restarts a failed watcher and ignores callbacks from the old request', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [oldSuccess, oldFailure] =
      mockGeolocation.watchPosition.mock.calls[0];
    oldFailure({ code: 1 });
    service.retry();
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
    expect(service.isLoading()).toBe(true);
    expect(service.error()).toBe('denied');
    oldSuccess({ coords: { latitude: 1, longitude: 2 } });
    expect(service.coordinate()).toBeNull();
    const [success] = mockGeolocation.watchPosition.mock.calls[1];
    success({ coords: { latitude: 52, longitude: 13 } });
    expect(service.isValid()).toBe(true);
    expect(service.coordinate()).toEqual({ latitude: 52, longitude: 13 });
    expect(mockGeolocation.watchPosition).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, maximumAge: 60000 },
    );
  });

  it('cleans up its watcher on destruction', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    service.ngOnDestroy();
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
  });
  it.each([2, 3])(
    'keeps the watcher alive on transient error %s and recovers from it',
    (code) => {
      mockGeolocation.watchPosition.mockReturnValue(123);
      service.getLocation();
      const [success, failure] = mockGeolocation.watchPosition.mock.calls[0];
      success({ coords: { latitude: 52, longitude: 13 } });
      failure({ code });
      vi.advanceTimersByTime(120000);
      expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(1);
      expect(mockGeolocation.clearWatch).not.toHaveBeenCalled();
      expect(service.coordinate()).toEqual({ latitude: 52, longitude: 13 });
      expect(service.isValid()).toBe(false);
      success({ coords: { latitude: 53, longitude: 14 } });
      expect(service.error()).toBeNull();
      expect(service.isValid()).toBe(true);
      expect(service.coordinate()).toEqual({ latitude: 53, longitude: 14 });
    },
  );

  it('recovers from an initial transient failure without inventing a position', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [success, failure] = mockGeolocation.watchPosition.mock.calls[0];
    failure({ code: 2 });
    expect(service.coordinate()).toBeNull();
    expect(service.error()).toBe('unavailable');
    success({ coords: { latitude: 52, longitude: 13 } });
    expect(service.isValid()).toBe(true);
    expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(1);
  });

  it('uses a cached fix immediately while the watcher starts', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [cached, noCache, options] =
      mockGeolocation.getCurrentPosition.mock.calls[0];
    expect(options).toEqual({
      enableHighAccuracy: false,
      maximumAge: Infinity,
      timeout: 0,
    });
    cached({ coords: { latitude: 50, longitude: 10 } });
    expect(service.isValid()).toBe(true);
    expect(service.coordinate()).toEqual({ latitude: 50, longitude: 10 });
    noCache({ code: 3 });
    expect(service.error()).toBeNull();
  });

  it('does not let a cached fix override a live one', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [cached] = mockGeolocation.getCurrentPosition.mock.calls[0];
    mockGeolocation.watchPosition.mock.calls[0][0]({
      coords: { latitude: 52, longitude: 13 },
    });
    cached({ coords: { latitude: 50, longitude: 10 } });
    expect(service.coordinate()).toEqual({ latitude: 52, longitude: 13 });
  });

  it('ignores a cached fix from a superseded request', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [cached] = mockGeolocation.getCurrentPosition.mock.calls[0];
    service.ngOnDestroy();
    cached({ coords: { latitude: 50, longitude: 10 } });
    expect(service.coordinate()).toBeNull();
  });

  it('does not retry permission denial automatically', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [, fail] = mockGeolocation.watchPosition.mock.calls[0];
    fail({ code: 2 });
    fail({ code: 1 });
    vi.advanceTimersByTime(60000);
    expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(1);
  });
});
