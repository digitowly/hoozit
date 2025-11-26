import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { ClientStorageService } from '../../../../services/client-storage/client-storage.service';
import { SearchResultSelectionService } from './search-result-selection.service';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

describe('SearchResultSelectionService', () => {
  let service: SearchResultSelectionService;

  const mockClientStorageService = {
    set: vi.fn(),
    get: vi.fn().mockReturnValue([]),
  };

  const mockSelection = {
    binomial_name: 'test',
    gbif_key: '123',
    id: 12,
    name: 'test-name',
    thumbnail: '',
  };

  const mockSelection2 = {
    binomial_name: 'test-2',
    gbif_key: '456',
    id: 45,
    name: 'test-2-name',
    thumbnail: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SearchResultSelectionService,
        { provide: ClientStorageService, useValue: mockClientStorageService },
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(SearchResultSelectionService);
  });

  it('should add a selection', () => {
    service.addSelection(mockSelection);
    expect(service.selections()).toEqual([mockSelection]);
  });

  it('should not add a selection if it is already selected', () => {
    service.addSelection(mockSelection);
    service.addSelection(mockSelection);
    expect(service.selections()).toEqual([mockSelection]);
  });

  it('should remove the selection', () => {
    // setup selections
    service.addSelection(mockSelection);
    service.addSelection(mockSelection2);
    expect(service.selections()).toEqual([mockSelection, mockSelection2]);

    // remove
    service.removeSelection(mockSelection.id);
    expect(service.selections()).toEqual([mockSelection2]);
  });

  it('should check if two selections are equal', () => {
    service.addSelection(mockSelection);
    service.addSelection(mockSelection2);

    const result1 = service.hasIdenticalSelections([
      mockSelection,
      mockSelection2,
    ]);

    const result2 = service.hasIdenticalSelections([]);

    const result3 = service.hasIdenticalSelections([mockSelection]);

    expect(result1).toBeTruthy();
    expect(result2).toBeFalsy();
    expect(result3).toBeFalsy();
  });
});
