import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpeciesContentService } from './species-content.service';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SpeciesContentService', () => {
  let service: SpeciesContentService;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SpeciesContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set isLoading to true when getIntroduction is called and false when complete', async () => {
    const mockResponse = { data: 'test' };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.introductionResource.isLoading()).toBe(false);

    service.getIntroduction(42);

    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    expect(service.introductionResource.value()).toEqual(mockResponse);
    expect(service.introductionResource.isLoading()).toBe(false);
  });

  it('should handle error', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    service.getIntroduction(42);

    TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();

    // Service catches error and returns null
    expect(service.introductionResource.value()).toBe(null);
    expect(service.introductionResource.error()).toBeUndefined();
  });
});
