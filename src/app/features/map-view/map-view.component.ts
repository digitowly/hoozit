import {Component, signal} from '@angular/core';
import {AppMapComponent} from '../app-map/app-map.component';
import {FloatingButtonComponent} from '../../components/floating-button/floating-button.component';
import {IconComponent} from '../../components/icon/icon.component';
import {ModalComponent} from '../../components/modal/modal.component';
import {OccurrenceSearchComponent} from '../search/components/occurrence-search/occurrence-search.component';
import {AnimalSearchService} from '../../services/animal-search/animal-search.service';
import {AnimalSearchResult} from '../../services/animal-search/animal-search.model';

@Component({
  selector: 'map-view',
  imports: [AppMapComponent, FloatingButtonComponent, IconComponent, ModalComponent, OccurrenceSearchComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent {
  result = signal<AnimalSearchResult[]>([]);
  isSearchModalOpen = signal(false);

  handleSearch(searchTerm: string) {
    this.animalSearch.getOccurrences(searchTerm)
      .subscribe((result) => {
        this.result.set(result.data);
      });
  }
  
  constructor(public animalSearch: AnimalSearchService) {
  }
}
