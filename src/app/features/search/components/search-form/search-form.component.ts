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

  searchForm = new FormGroup({
    query: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  onSearch = output<string>();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  constructor() {
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

  onSubmit() {
    if (!this.query?.value) return;

    this.validateTerm(this.query.value).subscribe((term) => {
      this.onSearch.emit(term);
    });
  }

  private validateTerm(term: string | null) {
    if (!this.query?.valid || !term) {
      return of('');
    }
    return of(term);
  }
}
