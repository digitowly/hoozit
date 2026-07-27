import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OccurrenceSearchService } from './occurrence-search.service';
import {
  OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
  OccurrenceSearchResponse,
} from './occurrence-search.model';

describe('OccurrenceSearchService', () => {
  let service: OccurrenceSearchService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(OccurrenceSearchService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('posts the requested location, radius level, and taxon keys to Scout', async () => {
    const response: OccurrenceSearchResponse = { total: 0, results: [] };
    fetchMock.mockResolvedValue(okResponse(response));

    service.search({ latitude: 48.8566, longitude: 2.3522 }, ['1', '2'], 5);
    TestBed.tick();

    const request = fetchRequest();
    expect(request.url).toBe('http://localhost:8080/occurrences/search');
    expect(request.init).toEqual(
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(JSON.parse(request.init.body as string)).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
      radius_level: 5,
      taxon_keys: ['1', '2'],
    });
    await settleResource();
    TestBed.tick();

    expect(service.resource.value()).toEqual(response);
  });

  it('uses the default Scout radius level when none is supplied', async () => {
    const response: OccurrenceSearchResponse = { total: 0, results: [] };
    fetchMock.mockResolvedValue(okResponse(response));

    service.search({ latitude: 48.8566, longitude: 2.3522 }, ['1']);
    TestBed.tick();

    expect(JSON.parse(fetchRequest().init.body as string).radius_level).toBe(
      OCCURRENCE_SEARCH_DEFAULT_RADIUS_LEVEL,
    );
    await settleResource();
    TestBed.tick();

    expect(service.resource.value()).toEqual(response);
  });

  it('returns null and records an error when Scout rejects the search', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
    } as Response);

    service.search({ latitude: 0, longitude: 0 }, ['1']);
    TestBed.tick();

    await settleResource();
    TestBed.tick();

    expect(service.resource.value()).toBeNull();
    expect(service.error()).toBe('Client error: Invalid request');
    expect(service.isLoading()).toBe(false);
  });

  it('clears a previous error before starting a new search', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response);

    service.search({ latitude: 0, longitude: 0 }, ['1']);
    TestBed.tick();

    await settleResource();
    TestBed.tick();
    expect(service.resource.value()).toBeNull();

    expect(service.error()).toBe('Client error: Invalid request');

    fetchMock.mockResolvedValueOnce(okResponse({ total: 0, results: [] }));
    service.search({ latitude: 1, longitude: 1 }, ['1']);

    expect(service.error()).toBeNull();
    TestBed.tick();
    await settleResource();
    TestBed.tick();
    expect(service.resource.value()).toEqual({ total: 0, results: [] });
  });

  it('reloads the resource with the latest search request', async () => {
    const initialResponse: OccurrenceSearchResponse = { total: 0, results: [] };
    const reloadResponse: OccurrenceSearchResponse = { total: 1, results: [] };
    fetchMock
      .mockResolvedValueOnce(okResponse(initialResponse))
      .mockResolvedValueOnce(okResponse(reloadResponse));

    service.search({ latitude: 48.8566, longitude: 2.3522 }, ['1'], 5);
    TestBed.tick();

    await settleResource();
    TestBed.tick();
    expect(service.resource.value()).toEqual(initialResponse);

    expect(service.resource.reload()).toBe(true);
    TestBed.tick();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [, reloadInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(reloadInit.body as string)).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
      radius_level: 5,
      taxon_keys: ['1'],
    });
    await settleResource();
    TestBed.tick();

    expect(service.resource.value()).toEqual(reloadResponse);
  });
});

function settleResource() {
  return new Promise((resolve) => setTimeout(resolve));
}

function okResponse(payload: OccurrenceSearchResponse): Response {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  } as Response;
}

function fetchRequest() {
  const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [
    string,
    RequestInit,
  ];
  return { url, init };
}
