import { Component, effect, EventEmitter, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  of,
  switchMap,
} from 'rxjs';
import { AnimalSearchResponse } from '../../../../services/animal-search/animal-search.model';
import { AnimalSearchService } from '../../../../services/animal-search/animal-search.service';

@Component({
  selector: 'occurrence-search-form',
  imports: [ReactiveFormsModule],
  templateUrl: './occurrence-search-form.component.html',
  styleUrl: './occurrence-search-form.component.scss',
})
export class OccurrenceSearchFormComponent {
  searchForm = new FormGroup({
    query: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  @Output() onSearch = new EventEmitter<AnimalSearchResponse>();

  constructor(private animalSearch: AnimalSearchService) {
    effect(() => {
      this.query?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((term) => {
            return this.handleSearch(term);
          })
        )
        .subscribe((response) => {
          this.onSearch.emit(response);
        });
    });

    effect(() => {
      this.searchForm.setErrors({ requestError: this.animalSearch.error() });
    });
  }

  get query() {
    return this.searchForm.get('query');
  }

  onSubmit() {
    console.log(this.searchForm.value);
    if (!this.query?.value) {
      return;
    }
    this.handleSearch(this.query.value).subscribe((response) => {
      this.onSearch.emit(response);
    });
  }

  private handleSearch(term: string | null) {
    if (!this.query?.valid || !term) {
      return of({ data: [] });
    }
    return this.animalSearch.getOccurrences(term);
  }
}
