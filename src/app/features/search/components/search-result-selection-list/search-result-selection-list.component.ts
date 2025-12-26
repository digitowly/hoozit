import { Component, computed, signal } from '@angular/core';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { IconComponent } from '../../../../components/icon/icon.component';
import { NgClass } from '@angular/common';
import { SpeciesContentService } from '../../../../services/species-content/species-content.service';
import { SpeciesIntroduction } from '../../../../services/species-content/species-content.model';
import { SpeciesOverviewModalComponent } from '../../../modals/species-overview-modal/species-overview-modal.component';

@Component({
  selector: 'search-result-selection-list',
  imports: [IconComponent, NgClass, SpeciesOverviewModalComponent],
  templateUrl: './search-result-selection-list.component.html',
  styleUrl: './search-result-selection-list.component.scss',
})
export class SearchResultSelectionListComponent {
  isModalOpen = signal(false);

  isListExpanded = signal(false);

  selected = signal<AnimalSearchResult | null>(null);

  isVisible = computed(() => this.selections.selections().length > 0);

  selectedIntroduction = signal<SpeciesIntroduction | null>(null);

  constructor(
    public selections: SearchResultSelectionService,
    protected speciesContent: SpeciesContentService,
  ) {}

  toggleList() {
    this.isListExpanded.update((o) => !o);
  }

  select(selection: AnimalSearchResult) {
    this.selected.set(selection);
    this.speciesContent
      .getIntroduction(selection.id)
      .subscribe(this.selectedIntroduction.set);
    this.isModalOpen.set(true);
  }

  removeSelection(id: number) {
    this.selections.removeSelection(id);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
