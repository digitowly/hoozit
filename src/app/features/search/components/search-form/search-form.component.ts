import {
  Component,
  effect,
  ElementRef,
  input,
  output,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IconComponent } from '../../../../components/icon/icon.component';

@Component({
  selector: 'search-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
})
export class SearchFormComponent {
  isActive = input(false);
  isLoading = input(false);

  defaultTerm = input('');

  searchForm = new FormGroup({
    query: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });

  onSearch = output<string>();

  onSearchTermChange = output<string>();

  onSearchTermFocus = output();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  isResultListVisible = input(false);

  onHideResultList = output();

  constructor() {
    effect((onCleanup) => {
      const blurOnEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') this.searchInputRef.nativeElement.blur();
      };

      window.addEventListener('keydown', blurOnEscape);
      onCleanup(() => {
        window.removeEventListener('keydown', blurOnEscape);
      });
    });

    effect(() => {
      if (this.defaultTerm()) {
        this.searchForm.patchValue({
          query: this.defaultTerm(),
        });
      }
    });

    effect(() => {
      if (this.isActive() && this.searchInputRef) {
        this.searchInputRef.nativeElement.focus();
      }
    });
  }

  get query() {
    return this.searchForm.controls.query;
  }

  onQueryChange() {
    const term = this.query.value;
    this.onSearchTermChange.emit(term);
    this.onSearch.emit(term.trim());
  }

  onQueryFocus() {
    this.onSearchTermFocus.emit();
  }

  onSubmit() {
    const term = this.query.value.trim();
    if (term.length >= 3) this.onSearch.emit(term);
  }

  hideResultList(event: Event) {
    this.onHideResultList.emit();
    event.preventDefault();
    event.stopPropagation();
  }

  clearInput() {
    this.query.setValue('');
    this.onQueryChange();
    this.searchInputRef.nativeElement.focus();
  }
}
