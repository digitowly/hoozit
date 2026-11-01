import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
  viewChild,
} from '@angular/core';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { IconComponent } from '../../../../components/icon/icon.component';
import { SelectionDockAnimation } from './selection-dock-animation';

@Component({
  selector: 'search-result-selection-dock',
  imports: [IconComponent],
  templateUrl: './search-result-selection-dock.component.html',
  styleUrl: './search-result-selection-dock.component.scss',
})
export class SearchResultSelectionDockComponent {
  readonly selections = input.required<AnimalSearchResult[]>();
  readonly selectionOpened = output<AnimalSearchResult>();
  readonly selectionRemoved = output<number>();

  private readonly dock = viewChild<ElementRef<HTMLElement>>('dock');
  private readonly animation = new SelectionDockAnimation();
  private readonly autoExpandList = computed(() => {
    const count = this.selections().length;
    return count > 0 && count < 3;
  });

  readonly isListExpanded = linkedSignal(() => this.autoExpandList());

  constructor() {
    effect(() => {
      this.selections();
      this.animation.stop();
    });
    inject(DestroyRef).onDestroy(() => this.animation.stop());
  }

  toggleList() {
    const dock = this.dock()?.nativeElement;
    if (!dock) return;

    const expanded = !this.isListExpanded();
    this.animation.toggle(dock, expanded, () =>
      this.isListExpanded.set(expanded),
    );
  }

  select(selection: AnimalSearchResult) {
    this.animation.stop();
    this.selectionOpened.emit(selection);
  }
}
