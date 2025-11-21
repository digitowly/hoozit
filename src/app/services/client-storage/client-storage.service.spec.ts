import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  ClientStorageKey,
  ClientStorageService,
} from './client-storage.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { localStorageMock } from '../../../mock/localStorage';

describe('ClientStorageService', () => {
  let service: ClientStorageService;

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: { ...localStorageMock },
    });

    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(ClientStorageService);

    vi.spyOn(localStorage, 'setItem');
    vi.spyOn(localStorage, 'removeItem');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set', () => {
    it('should set a key value pair for valid input', () => {
      const mockData = [{ id: 'test' }];
      service.set(ClientStorageKey.SEARCH_SELECTIONS, mockData);
      expect(localStorage.setItem).toHaveBeenCalledOnce();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        ClientStorageKey.SEARCH_SELECTIONS,
        JSON.stringify(mockData),
      );
    });

    it('should not do anything if the value is null', () => {
      service.set(ClientStorageKey.SEARCH_SELECTIONS, null);
      expect(localStorage.setItem).toHaveBeenCalledTimes(0);
    });
  });

  describe('get', () => {
    it('should get a value by key', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify('test'));

      const result = service.get(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.getItem).toHaveBeenCalledOnce();
      expect(localStorage.getItem).toHaveBeenCalledWith(
        ClientStorageKey.SEARCH_SELECTIONS,
      );

      expect(result).toEqual('test');
    });

    it('should handle empty values', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue(
        JSON.stringify(undefined),
      );

      const result = service.get(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.getItem).toHaveBeenCalledOnce();
      expect(localStorage.getItem).toHaveBeenCalledWith(
        ClientStorageKey.SEARCH_SELECTIONS,
      );

      expect(result).toEqual(null);
    });

    it('should handle potential json parse error', () => {
      vi.spyOn(localStorage, 'getItem').mockReturnValue('invalid json');

      const result = service.get(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.getItem).toHaveBeenCalledOnce();
      expect(localStorage.getItem).toHaveBeenCalledWith(
        ClientStorageKey.SEARCH_SELECTIONS,
      );
      expect(result).toEqual(null);
    });
  });

  describe('remove', () => {
    it('should remove by key', () => {
      service.remove(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.removeItem).toHaveBeenCalledOnce();
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        ClientStorageKey.SEARCH_SELECTIONS,
      );
    });
  });
});
