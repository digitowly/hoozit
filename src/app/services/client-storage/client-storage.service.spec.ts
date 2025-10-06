import { TestBed } from '@angular/core/testing';
import {
  ClientStorageKey,
  ClientStorageService,
} from './client-storage.service';

describe('ClientStorageService', () => {
  let service: ClientStorageService;

  beforeEach(() => {
    service = TestBed.inject(ClientStorageService);

    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set', () => {
    it('should set a key value pair for valid input', () => {
      const mockData = [{ id: 'test' }];
      service.set(ClientStorageKey.SEARCH_SELECTIONS, mockData);
      expect(localStorage.setItem).toHaveBeenCalledOnceWith(
        ClientStorageKey.SEARCH_SELECTIONS,
        JSON.stringify(mockData)
      );
    });

    it('should not do anything if the value is null', () => {
      service.set(ClientStorageKey.SEARCH_SELECTIONS, null);
      expect(localStorage.setItem).toHaveBeenCalledTimes(0);
    });
  });

  describe('get', () => {
    it('should get a value by key', () => {
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify('test'));

      const result = service.get(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.getItem).toHaveBeenCalledOnceWith(
        ClientStorageKey.SEARCH_SELECTIONS
      );

      expect(result).toEqual('test');
    });

    it('should handle empty values', () => {
      spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(undefined));

      const result = service.get(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.getItem).toHaveBeenCalledOnceWith(
        ClientStorageKey.SEARCH_SELECTIONS
      );

      expect(result).toEqual(null);
    });

    it('should handle potential json parse error', () => {
      spyOn(localStorage, 'getItem').and.returnValue('invalid json');

      const result = service.get(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.getItem).toHaveBeenCalledOnceWith(
        ClientStorageKey.SEARCH_SELECTIONS
      );
      expect(result).toEqual(null);
    });
  });

  describe('remove', () => {
    it('should remove by key', () => {
      service.remove(ClientStorageKey.SEARCH_SELECTIONS);
      expect(localStorage.removeItem).toHaveBeenCalledOnceWith(
        ClientStorageKey.SEARCH_SELECTIONS
      );
    });
  });
});
