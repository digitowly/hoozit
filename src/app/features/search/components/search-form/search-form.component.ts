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
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { IconComponent } from '../../../../components/icon/icon.component';

@Component({
  selector: 'search-form',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
})
export class SearchFormComponent {
  isActive = input(false);

  defaultTerm = input('');

  searchForm = new FormGroup({
    query: new FormControl<string>(this.defaultTerm(), [
      Validators.required,
      Validators.minLength(3),
    ]),
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

    effect(() => {
      this.query?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) => {
            return this.validateTerm(term);
          }),
        )
        .subscribe(() => this.onSubmit());
    });
  }

  get query() {
    return this.searchForm.get('query');
  }

  onQueryChange() {
    this.onSearchTermChange.emit(this.query?.value ?? '');
  }

  onQueryFocus() {
    this.onSearchTermFocus.emit();
  }

  onSubmit() {
    if (!this.query?.value) return;

    this.validateTerm(this.query.value).subscribe((term) => {
      if (term) this.onSearch.emit(term);
    });
  }

  hideResultList(event: Event) {
    this.onHideResultList.emit();
    event.preventDefault();
    event.stopPropagation();
  }

  clearInput() {
    this.searchForm.reset();
  }

  private validateTerm(term: string | null) {
    if (!this.query?.valid || !term) {
      return of('');
    }
    return of(term);
  }
}
