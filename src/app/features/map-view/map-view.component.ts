import { Component, computed, inject, signal } from '@angular/core';
import { AppMapComponent } from '../app-map/app-map.component';
import { OccurrenceSearchComponent } from '../search/components/occurrence-search/occurrence-search.component';
import { AnimalSearchService } from '../../services/animal-search/animal-search.service';
import { SearchResultSelectionListComponent } from '../search/components/search-result-selection-list/search-result-selection-list.component';

@Component({
  selector: 'map-view',
  imports: [
    AppMapComponent,
    OccurrenceSearchComponent,
    SearchResultSelectionListComponent,
  ],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent {
  private readonly animalSearchService = inject(AnimalSearchService);

  isSearchModalOpen = signal(false);

  occurrences = computed(
    () => this.animalSearchService.resource.value()?.data || [],
  );

  isSearchLoading = computed(() =>
    this.animalSearchService.resource.isLoading(),
  );

  handleSearch(searchTerm: string) {
    this.animalSearchService.searchAnimals(searchTerm);
  }
}
