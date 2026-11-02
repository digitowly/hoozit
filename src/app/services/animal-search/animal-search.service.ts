import { computed, Injectable, resource, signal } from '@angular/core';
import {
  AnimalSearchApiResponse,
  AnimalSearchResponse,
} from './animal-search.model';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnimalSearchService {
  private readonly apiUrl = `${environment.verdexUrl}/animals/search`;

  readonly isNotAvailable = signal(false);

  private readonly query = signal('');

  private readonly searchQuery$ = new Subject<string>();

  readonly debouncedQuery = toSignal(
    this.searchQuery$.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );

  readonly resource = resource({
    params: () => {
      const query = this.query();
      return query.length >= 3 && query === this.debouncedQuery()
        ? { q: query }
        : undefined;
    },
    loader: ({ params, abortSignal }) =>
      this.fetchAnimals(params.q, abortSignal),
  });

  readonly isLoading = computed(
    () =>
      this.query().length >= 3 &&
      (this.query() !== this.debouncedQuery() || this.resource.isLoading()),
  );

  searchAnimals(name: string) {
    const query = name.trim();
    if (query === this.query() && this.isNotAvailable()) {
      this.isNotAvailable.set(false);
      this.resource.reload();
      return;
    }
    if (query !== this.query()) this.resource.set(undefined);
    this.query.set(query);
    this.isNotAvailable.set(false);
    this.searchQuery$.next(query);
  }

  private async fetchAnimals(
    name: string,
    signal: AbortSignal,
  ): Promise<AnimalSearchResponse | null> {
    if (!name) return null;

    const url = `${this.apiUrl}?q=${encodeURIComponent(name)}&lang=de`;

    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        signal,
      });
      if (!response.ok) throw new Error('Species search failed');
      if (signal.aborted) return null;
      this.isNotAvailable.set(false);
      const payload = (await response.json()) as AnimalSearchApiResponse;
      return {
        data: payload.data.map(({ gbif_key, ...animal }) => ({
          ...animal,
          taxonKey: gbif_key,
        })),
      };
    } catch {
      if (!signal.aborted) this.isNotAvailable.set(true);
      return null;
    }
  }
}
