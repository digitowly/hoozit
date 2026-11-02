import { TestBed } from '@angular/core/testing';
import { UserLocationService } from './user-location.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('UserLocationService', () => {
  let service: UserLocationService;

  // Create a mock object for geolocation
  const mockGeolocation = {
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  beforeEach(() => {
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
  ])('invalidates a previous fix on error %s', (code, reason) => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const [success, failure] = mockGeolocation.watchPosition.mock.calls[0];
    success({ coords: { latitude: 52, longitude: 13 } });
    failure({ code });
    expect(service.coordinate()).toBeNull();
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
    expect(service.error()).toBeNull();
    oldSuccess({ coords: { latitude: 1, longitude: 2 } });
    expect(service.coordinate()).toBeNull();
    const [success] = mockGeolocation.watchPosition.mock.calls[1];
    success({ coords: { latitude: 52, longitude: 13 } });
    expect(service.isValid()).toBe(true);
    expect(service.coordinate()).toEqual({ latitude: 52, longitude: 13 });
    expect(mockGeolocation.watchPosition).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(Function),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 },
    );
  });

  it('cleans up its watcher on destruction', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    service.ngOnDestroy();
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(123);
  });
});
