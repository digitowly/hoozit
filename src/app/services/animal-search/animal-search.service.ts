import { Injectable, resource, signal } from '@angular/core';
import { AnimalSearchResponse } from './animal-search.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnimalSearchService {
  private readonly apiUrl = `${environment.verdexUrl}/animals/search`;

  private readonly searchQuery = signal('');

  resource = resource({
    params: () => ({ q: this.searchQuery(), lang: 'de' }),
    loader: ({ params }) => this.fetchAnimals(params.q),
  });

  searchAnimals(name: string) {
    this.searchQuery.set(name);
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
