import {
  Component,
  input,
  computed,
  output,
  ViewChild,
  ElementRef,
  effect,
} from '@angular/core';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { OccurrenceItemComponent } from '../occurrence-item/occurrence-item.component';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';

@Component({
  selector: 'search-result-list',
  imports: [OccurrenceItemComponent],
  templateUrl: './search-result-list.component.html',
  styleUrl: './search-result-list.component.scss',
})
export class SearchResultListComponent {
  list = input<AnimalSearchResult[]>([]);

  isLoading = input(false);

  readonly onItemSelect = output<AnimalSearchResult>();

  @ViewChild('listElement') listRef!: ElementRef<HTMLDivElement>;

  height = computed(() => this.calculateHeight());

  isManuallyHidden = input(false);

  isVisible = computed(
    () =>
      !this.isManuallyHidden() && (this.list().length > 0 || this.isLoading()),
  );

  onVisibilityChange = output<boolean>();

  constructor(private searchResultSelection: SearchResultSelectionService) {
    effect(() => {
      this.onVisibilityChange.emit(this.isVisible());
    });
  }

  handleItemSelection(result: AnimalSearchResult) {
    this.searchResultSelection.addSelection(result);
    this.onItemSelect.emit(result);
  }

  private calculateHeight(): string {
    if (!this.list().length) return 'auto';
    const distanceToBottom = this.calculateDistanceToBottom();
    const listHeight = this.list().length * 80;
    return listHeight > distanceToBottom ? distanceToBottom - 8 + 'px' : 'auto';
  }

  private calculateDistanceToBottom(): number {
    // Guard against ViewChild not yet available or element not rendered
    const rectTop = this.listRef?.nativeElement?.getBoundingClientRect?.().top;
    if (typeof rectTop !== 'number') {
      // Fallback: assume full viewport available to avoid runtime errors
      return window.innerHeight;
    }
    return window.innerHeight - rectTop;
  }
}
