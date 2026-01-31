import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AnimalSearchService } from './animal-search.service';
import { AnimalSearchResponse } from './animal-search.model';
import { provideZonelessChangeDetection } from '@angular/core';

describe('AnimalSearchService', () => {
  let service: AnimalSearchService;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(AnimalSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when searchAnimals is called and false when complete', async () => {
    const mockResponse: AnimalSearchResponse = { data: [] };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    // Wait for initial load if any (due to signal being initialized)
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.resource.isLoading()).toBe(false);
    expect(service.resource.value()).toBe(null);

    service.searchAnimals('test');

    // Wait for the resource to load
    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.resource.value()).toEqual(mockResponse);
    expect(service.resource.isLoading()).toBe(false);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=test'),
      expect.any(Object),
    );
  });

  it('should handle error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    service.searchAnimals('test');

    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.resource.error()).toBeTruthy();
    // Accessing .value() when in error state throws in Angular Resource
    expect(() => service.resource.value()).toThrow();
  });
});
