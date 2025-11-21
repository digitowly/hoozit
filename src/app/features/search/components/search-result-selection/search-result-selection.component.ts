import { Component, signal } from '@angular/core';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { IconComponent } from '../../../../components/icon/icon.component';

@Component({
  selector: 'search-result-selection',
  imports: [ModalComponent, IconComponent],
  templateUrl: './search-result-selection.component.html',
  styleUrl: './search-result-selection.component.scss',
})
export class SearchResultSelectionComponent {
  isModalOpen = signal(false);
  selected = signal<AnimalSearchResult | null>(null);

  constructor(public selections: SearchResultSelectionService) {}

  select(selection: AnimalSearchResult) {
    this.selected.set(selection);
    this.isModalOpen.set(true);
  }

  removeSelection(id: number) {
    this.selections.removeSelection(id);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
