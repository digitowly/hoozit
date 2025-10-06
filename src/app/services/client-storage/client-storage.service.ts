import { Injectable } from '@angular/core';

export enum ClientStorageKey {
  SEARCH_SELECTIONS = 'SEARCH_SELECTIONS',
}

@Injectable({
  providedIn: 'root',
})
export class ClientStorageService {
  set<T>(key: ClientStorageKey, value: T | null) {
    if (value === null) return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  get<T>(key: ClientStorageKey): T | null {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  remove(key: ClientStorageKey) {
    localStorage.removeItem(key);
  }
}
