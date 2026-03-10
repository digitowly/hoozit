import { Component, computed, inject, signal } from '@angular/core';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { IconComponent } from '../../../../components/icon/icon.component';
import { NgClass } from '@angular/common';
import { SpeciesContentService } from '../../../../services/species-content/species-content.service';
import { SpeciesOverviewModalComponent } from '../../../modals/species-overview-modal/species-overview-modal.component';
import { ModalService } from '../../../../services/modal/modal.service';

const MODAL_ID = 'species-overview';

@Component({
  selector: 'search-result-selection-list',
  imports: [IconComponent, NgClass, SpeciesOverviewModalComponent],
  templateUrl: './search-result-selection-list.component.html',
  styleUrl: './search-result-selection-list.component.scss',
})
export class SearchResultSelectionListComponent {
  private readonly selectionService = inject(SearchResultSelectionService);
  private readonly speciesContentService = inject(SpeciesContentService);
  private readonly modalService = inject(ModalService);

  readonly modalId = MODAL_ID;

  readonly isListExpanded = signal(false);

  readonly selections = computed(() => this.selectionService.selections());

  readonly isVisible = computed(() => this.selectionService.selections().length > 0);

  readonly selected = signal<AnimalSearchResult | null>(null);

  readonly introduction = computed(
    () => this.speciesContentService.introductionResource.value() || null,
  );

  readonly isIntroductionLoading = computed(() =>
    this.speciesContentService.introductionResource.isLoading(),
  );

  toggleList() {
    this.isListExpanded.update((o) => !o);
  }

  select(selection: AnimalSearchResult) {
    this.speciesContentService.getIntroduction(selection.id);
    this.selected.set(selection);
    this.modalService.open(this.modalId);
  }

  removeSelection(id: number) {
    this.selectionService.removeSelection(id);
  }

  closeModal() {
    this.modalService.close(this.modalId);
  }
}
