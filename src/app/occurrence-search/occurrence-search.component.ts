import { Component, EventEmitter, Output } from '@angular/core';
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
  of,
  switchMap,
} from 'rxjs';
import { VerdexService } from '../services/verdex.service';
import { OccurrenceResponse } from '../model/occurrence';

@Component({
  selector: 'app-occurrence-search',
  imports: [ReactiveFormsModule],
  templateUrl: './occurrence-search.component.html',
  styleUrl: './occurrence-search.component.scss',
})
export class OccurrenceSearchComponent {
  searchForm = new FormGroup({
    query: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  @Output() onSearch = new EventEmitter<OccurrenceResponse>();

  constructor(private verdexService: VerdexService) {}

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
    return this.verdexService.findOccurrences(term).pipe(
      catchError((error) => {
        console.error('search error:', error);
        return of({ data: [] });
      })
    );
  }

  ngOnInit() {
    this.query?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.handleSearch(term))
      )
      .subscribe((response) => {
        this.onSearch.emit(response);
      });
  }
}
