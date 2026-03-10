import { Injectable, resource, signal } from '@angular/core';
import { AnimalSearchResponse } from './animal-search.model';
import { environment } from '../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnimalSearchService {
  private readonly apiUrl = `${environment.verdexUrl}/animals/search`;

  private readonly searchQuery$ = new Subject<string>();

  readonly debouncedQuery = toSignal(
    this.searchQuery$.pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );

  readonly resource = resource({
    params: () => ({ q: this.debouncedQuery(), lang: 'de' }),
    loader: ({ params }) => this.fetchAnimals(params.q),
  });

  searchAnimals(name: string) {
    if (name.length < 3) return;
    this.searchQuery$.next(name);
  }

  private async fetchAnimals(
    name: string,
  ): Promise<AnimalSearchResponse | null> {
    if (!name) return null;

    const url = `${this.apiUrl}?q=${name}&lang=de`;
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  }
}
