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

    vi.clearAllMocks();
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
    expect(service.isValid()).toBe(true);
  });

  it('should set error state when geolocation fails', () => {
    // Mock watchPosition to immediately call the error callback
    mockGeolocation.watchPosition.mockImplementation((_, error) => {
      if (error) error({ code: 1, message: 'User denied' } as any);
      return 100;
    });

    service.getLocation();

    // isValid is true if (initialized && !hasError)
    // Here initialized=true, but hasError=true -> result false
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
});
