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
    localStorage.clear();
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

  it('restores the last known position as stale until a live fix arrives', () => {
    localStorage.setItem(
      'LAST_LOCATION',
      JSON.stringify({ latitude: 48, longitude: 11 }),
    );
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    expect(service.coordinate()).toEqual({ latitude: 48, longitude: 11 });
    expect(service.isStale()).toBe(true);
    expect(service.isValid()).toBe(false);
    expect(service.isShowingLastKnown()).toBe(true);
    mockGeolocation.watchPosition.mock.calls[0][0]({
      coords: { latitude: 52, longitude: 13 },
    });
    expect(service.isStale()).toBe(false);
    expect(service.isValid()).toBe(true);
    expect(service.isShowingLastKnown()).toBe(false);
  });

  it('lets a cached browser fix replace a remembered position', () => {
    localStorage.setItem(
      'LAST_LOCATION',
      JSON.stringify({ latitude: 48, longitude: 11 }),
    );
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    mockGeolocation.getCurrentPosition.mock.calls[0][0]({
      coords: { latitude: 50, longitude: 10 },
    });
    expect(service.coordinate()).toEqual({ latitude: 50, longitude: 10 });
    expect(service.isValid()).toBe(true);
  });

  it('does not overwrite an in-memory position with the remembered one', () => {
    localStorage.setItem(
      'LAST_LOCATION',
      JSON.stringify({ latitude: 48, longitude: 11 }),
    );
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.coordinate.set({ latitude: 52, longitude: 13 });
    service.getLocation();
    expect(service.coordinate()).toEqual({ latitude: 52, longitude: 13 });
    expect(service.isStale()).toBe(false);
  });

  it.each([
    ['garbage', 'not json'],
    ['incomplete', JSON.stringify({ latitude: 48 })],
  ])('ignores a %s remembered position', (_, value) => {
    localStorage.setItem('LAST_LOCATION', value);
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    expect(service.coordinate()).toBeNull();
    expect(service.isStale()).toBe(false);
  });

  it('remembers live fixes', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    mockGeolocation.watchPosition.mock.calls[0][0]({
      coords: { latitude: 52, longitude: 13 },
    });
    expect(JSON.parse(localStorage.getItem('LAST_LOCATION')!)).toEqual({
      latitude: 52,
      longitude: 13,
    });
  });

  it('forgets the remembered position when permission is denied', () => {
    localStorage.setItem(
      'LAST_LOCATION',
      JSON.stringify({ latitude: 48, longitude: 11 }),
    );
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    mockGeolocation.watchPosition.mock.calls[0][1]({ code: 1 });
    expect(localStorage.getItem('LAST_LOCATION')).toBeNull();
    expect(service.coordinate()).toBeNull();
    expect(service.isStale()).toBe(false);
  });

  it('polls with backoff after transient errors without restarting the watcher', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const pollOptions = {
      enableHighAccuracy: false,
      maximumAge: 60000,
      timeout: 20000,
    };
    mockGeolocation.watchPosition.mock.calls[0][1]({ code: 2 });
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(5000);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(Function),
      pollOptions,
    );
    mockGeolocation.getCurrentPosition.mock.calls[1][1]({ code: 3 });
    expect(service.error()).toBe('timeout');
    vi.advanceTimersByTime(9999);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(3);
    mockGeolocation.getCurrentPosition.mock.calls[2][0]({
      coords: { latitude: 52, longitude: 13 },
    });
    expect(service.isValid()).toBe(true);
    vi.advanceTimersByTime(120000);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(3);
    expect(mockGeolocation.watchPosition).toHaveBeenCalledTimes(1);
    expect(mockGeolocation.clearWatch).not.toHaveBeenCalled();
  });

  it('caps the poll backoff', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const fail = mockGeolocation.watchPosition.mock.calls[0][1];
    for (const delay of [5000, 10000, 20000, 40000, 60000, 60000]) {
      fail({ code: 2 });
      const calls = mockGeolocation.getCurrentPosition.mock.calls.length;
      vi.advanceTimersByTime(delay - 1);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(calls);
      vi.advanceTimersByTime(1);
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(
        calls + 1,
      );
    }
  });

  it('cancels a scheduled poll on destruction and ignores late poll results', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    mockGeolocation.watchPosition.mock.calls[0][1]({ code: 3 });
    vi.advanceTimersByTime(5000);
    const [lateSuccess] = mockGeolocation.getCurrentPosition.mock.calls[1];
    mockGeolocation.watchPosition.mock.calls[0][1]({ code: 3 });
    service.ngOnDestroy();
    vi.advanceTimersByTime(120000);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(2);
    lateSuccess({ coords: { latitude: 1, longitude: 2 } });
    expect(service.coordinate()).toBeNull();
  });

  it('stops polling when permission is denied', () => {
    mockGeolocation.watchPosition.mockReturnValue(123);
    service.getLocation();
    const fail = mockGeolocation.watchPosition.mock.calls[0][1];
    fail({ code: 2 });
    fail({ code: 1 });
    vi.advanceTimersByTime(120000);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
  });
});
