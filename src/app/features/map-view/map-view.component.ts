import { Component, signal } from '@angular/core';
import { AppMapComponent } from '../app-map/app-map.component';
import { OccurrenceSearchComponent } from '../search/components/occurrence-search/occurrence-search.component';
import { AnimalSearchService } from '../../services/animal-search/animal-search.service';
import { AnimalSearchResult } from '../../services/animal-search/animal-search.model';

@Component({
  selector: 'map-view',
  imports: [AppMapComponent, OccurrenceSearchComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent {
  searchResults = signal<AnimalSearchResult[]>([]);
  isSearchModalOpen = signal(false);

  handleSearch(searchTerm: string) {
    this.animalSearch.getOccurrences(searchTerm).subscribe((result) => {
      this.searchResults.set(result.data);
    });
  }

  constructor(public animalSearch: AnimalSearchService) {}
}
