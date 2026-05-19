import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SpeciesAutosuggestService } from './species-autosuggest.service';
import { AnimalSearchService } from '../../animal-search/animal-search.service';
import { signal } from '@angular/core';

describe('SpeciesAutosuggestService', () => {
  let service: SpeciesAutosuggestService;
  let mockAnimalSearchService: any;

  beforeEach(() => {
    mockAnimalSearchService = {
      resource: {
        value: signal(null),
      },
      isNotAvailable: signal(false),
      debouncedQuery: signal(''),
      searchAnimals: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        SpeciesAutosuggestService,
        { provide: AnimalSearchService, useValue: mockAnimalSearchService },
      ],
    });
    service = TestBed.inject(SpeciesAutosuggestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty entries when resource is null', () => {
    expect(service.speciesEntries()).toEqual([]);
  });

  it('should map resource data to speciesEntries', () => {
    mockAnimalSearchService.resource.value.set({
      data: [
        { name: 'Cat', binomial_name: 'Felis catus', thumbnail: 'cat.jpg' },
      ],
    });

    expect(service.speciesEntries()).toEqual([
      { label: 'Cat', value: 'Felis catus', icon: 'cat.jpg' },
    ]);
  });

  it('should find selectedEntry from speciesEntries', () => {
    mockAnimalSearchService.resource.value.set({
      data: [
        { name: 'Cat', binomial_name: 'Felis catus', thumbnail: 'cat.jpg' },
      ],
    });
    mockAnimalSearchService.debouncedQuery.set('cat');

    expect(service.selectedEntry()).toEqual({
      label: 'Cat',
      value: 'Felis catus',
      icon: 'cat.jpg',
    });
  });

  it('should return a fallback entry when no match is found and query length >= 3', () => {
    mockAnimalSearchService.resource.value.set({ data: [] });
    mockAnimalSearchService.debouncedQuery.set('Unknown');

    expect(service.selectedEntry()).toEqual({
      label: 'Unknown',
      value: 'Unknown',
    });
  });

  it('should return undefined when no match is found and query length < 3', () => {
    mockAnimalSearchService.resource.value.set({ data: [] });
    mockAnimalSearchService.debouncedQuery.set('Un');

    expect(service.selectedEntry()).toBeNull();
  });

  it('should return current input as entry when server is unreachable', () => {
    mockAnimalSearchService.isNotAvailable.set(true);
    mockAnimalSearchService.debouncedQuery.set('lion');

    expect(service.speciesEntries()).toEqual([{ label: 'lion', value: 'lion' }]);
  });

  it('should return empty entries when server is unreachable and query is empty', () => {
    mockAnimalSearchService.isNotAvailable.set(true);

    expect(service.speciesEntries()).toEqual([]);
  });

  it('should prioritize exact (case-insensitive) match over fallback', () => {
    mockAnimalSearchService.resource.value.set({
      data: [
        { name: 'Cat', binomial_name: 'Felis catus', thumbnail: 'cat.jpg' },
      ],
    });
    mockAnimalSearchService.debouncedQuery.set('Cat');

    expect(service.selectedEntry()).toEqual({
      label: 'Cat',
      value: 'Felis catus',
      icon: 'cat.jpg',
    });
  });
});
