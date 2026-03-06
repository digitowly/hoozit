import {
  afterRenderEffect,
  Component,
  computed,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import { FormsModule } from '@angular/forms';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { AutoSuggestEntry } from './autosuggest.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'autosuggest',
  imports: [
    FormsModule,
    CdkConnectedOverlay,
    Option,
    Combobox,
    ComboboxInput,
    ComboboxPopupContainer,
    Listbox,
    IconComponent,
  ],
  templateUrl: './autosuggest.component.html',
  styleUrl: './autosuggest.component.scss',
})
export class AutosuggestComponent {
  readonly listbox = viewChild<Listbox<string>>(Listbox);

  readonly options = viewChildren<Option<string>>(Option);

  readonly combobox = viewChild<Combobox<string>>(Combobox);

  readonly placeholder = input('');

  readonly disabled = input(false);

  readonly onQueryChange = output<string>();

  readonly query = signal('');

  readonly entries = input<AutoSuggestEntry[]>([]);

  readonly suggestions = computed(() => this.entries());

  readonly selectedIcon = computed(() => {
    return this.suggestions().find(
      (entry) => entry.label.toLowerCase() === this.query().toLowerCase(),
    )?.icon;
  });

  handleValueChange(value: string) {
    this.query.set(value);
    const isSelection = this.entries().some(
      (e) => e.label.toLowerCase() === value.toLowerCase(),
    );
    if (!isSelection) {
      this.onQueryChange.emit(value);
    }
  }

  scrollToActiveOption() {
    const options = this.options();
    const option = options.find((opt) => opt.active());
    if (option) {
      setTimeout(() => option.element.scrollIntoView({ block: 'nearest' }), 50);
    }
  }

  resetListboxScroll() {
    const expanded = this.combobox()?.expanded();
    if (expanded === false) {
      const listbox = this.listbox();
      if (listbox) {
        setTimeout(() => listbox.element.scrollTo(0, 0), 150);
      }
    }
  }

  constructor() {
    // Scrolls to the active item when the active option changes.
    // The slight delay here is to ensure animations are done before scrolling.
    afterRenderEffect(() => {
      this.scrollToActiveOption();
    });

    // Resets the listbox scroll position when the combobox is closed.
    afterRenderEffect(() => {
      this.resetListboxScroll();
    });
  }

  protected readonly decodeURI = decodeURI;
}
