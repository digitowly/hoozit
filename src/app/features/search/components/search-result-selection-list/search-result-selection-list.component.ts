import { Component, signal } from '@angular/core';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { IconComponent } from '../../../../components/icon/icon.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'search-result-selection-list',
  imports: [ModalComponent, IconComponent, NgClass],
  templateUrl: './search-result-selection-list.component.html',
  styleUrl: './search-result-selection-list.component.scss',
})
export class SearchResultSelectionListComponent {
  isModalOpen = signal(false);

  isListExpanded = signal(false);

  selected = signal<AnimalSearchResult | null>(null);

  constructor(public selections: SearchResultSelectionService) {}

  toggleList() {
    this.isListExpanded.update((o) => !o);
  }

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
