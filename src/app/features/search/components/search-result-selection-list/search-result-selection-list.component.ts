import { Component, computed, inject, signal } from '@angular/core';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { IconComponent } from '../../../../components/icon/icon.component';
import { NgClass } from '@angular/common';
import { SpeciesContentService } from '../../../../services/species-content/species-content.service';
import { SpeciesOverviewModalComponent } from '../../../modals/species-overview-modal/species-overview-modal.component';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, EMPTY, filter, switchMap } from 'rxjs';

@Component({
  selector: 'search-result-selection-list',
  imports: [IconComponent, NgClass, SpeciesOverviewModalComponent],
  templateUrl: './search-result-selection-list.component.html',
  styleUrl: './search-result-selection-list.component.scss',
})
export class SearchResultSelectionListComponent {
  private readonly selectionService = inject(SearchResultSelectionService);

  private readonly speciesContentService = inject(SpeciesContentService);

  isModalOpen = signal(false);

  isListExpanded = signal(false);

  selections = computed(() => this.selectionService.selections());

  isVisible = computed(() => this.selectionService.selections().length > 0);

  selected = signal<AnimalSearchResult | null>(null);

  introduction = computed(
    () => this.speciesContentService.introductionResource.value() || null,
  );

  isIntroductionLoading = computed(() =>
    this.speciesContentService.introductionResource.isLoading(),
  );

  toggleList() {
    this.isListExpanded.update((o) => !o);
  }

  select(selection: AnimalSearchResult) {
    this.speciesContentService.getIntroduction(selection.id);
    this.selected.set(selection);
    this.isModalOpen.set(true);
  }

  removeSelection(id: number) {
    this.selectionService.removeSelection(id);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
