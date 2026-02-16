import { describe, afterEach, beforeEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AnimalSearchService } from './animal-search.service';
import { AnimalSearchResponse } from './animal-search.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AnimalSearchService', () => {
  let service: AnimalSearchService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(AnimalSearchService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not search if query length is less than 3', async () => {
    service.searchAnimals('te');
    vi.advanceTimersByTime(300);
    TestBed.tick();

    expect(fetch).not.toHaveBeenCalled();
    expect(service.resource.value()).toBeFalsy();
  });

  it('should not search if query length is less than 3 even after time passes', async () => {
    service.searchAnimals('te');
    vi.advanceTimersByTime(1000);
    TestBed.tick();

    expect(fetch).not.toHaveBeenCalled();
  });

  it('should only search when name changes (distinctUntilChanged)', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    service.searchAnimals('test');
    vi.advanceTimersByTime(300);
    TestBed.tick();
    await vi.waitFor(() => expect(service.resource.isLoading()).toBe(false));
    expect(fetch).toHaveBeenCalledTimes(1);

    service.searchAnimals('test');
    vi.advanceTimersByTime(300);
    TestBed.tick();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should set isLoading to true when searchAnimals is called and false when complete', async () => {
    const mockResponse: AnimalSearchResponse = { data: [] };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    // Initial check
    TestBed.tick();
    // Wait for the initial load which might be triggered by empty query
    if (service.resource.isLoading()) {
      await vi.waitFor(() => expect(service.resource.isLoading()).toBe(false));
    }
    expect(service.resource.isLoading()).toBe(false);

    service.searchAnimals('test');

    vi.advanceTimersByTime(300);
    TestBed.tick();

    expect(service.resource.isLoading()).toBe(true);

    // Wait for the fetch promise to resolve
    await vi.waitFor(() => expect(service.resource.isLoading()).toBe(false));

    expect(service.resource.value()).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=test'),
      expect.any(Object),
    );
  });

  it('should handle error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    service.searchAnimals('test');
    vi.advanceTimersByTime(300);
    TestBed.tick();

    await vi.waitFor(() => expect(service.resource.isLoading()).toBe(false));

    expect(service.resource.error()).toBeTruthy();
    expect(() => service.resource.value()).toThrow();
  });

  it('should return null from fetchAnimals if name is empty', async () => {
    TestBed.tick();
    if (service.resource.isLoading()) {
      await vi.waitFor(() => expect(service.resource.isLoading()).toBe(false));
    }
    expect(service.resource.value()).toBeFalsy();
    expect(fetch).not.toHaveBeenCalled();
  });
});
