import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OccurrenceSearchComponent } from './occurrence-search.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SearchFormComponent } from '../search-form/search-form.component';
import { SearchResultListComponent } from '../search-result-list/search-result-list.component';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';

describe('OccurrenceSearchComponent', () => {
  let component: OccurrenceSearchComponent;
  let fixture: ComponentFixture<OccurrenceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceSearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onSearch when SearchForm emits onSearch', () => {
    const emitted: string[] = [];
    component.onSearch.subscribe((term: string) => emitted.push(term));

    const searchFormDE = fixture.debugElement.query(By.directive(SearchFormComponent));
    const searchFormCmp = searchFormDE.componentInstance as SearchFormComponent;

    searchFormCmp.onSearch.emit('owl');

    expect(emitted).toEqual(['owl']);
  });

  it('should emit onResultSelection when SearchResultList emits onItemSelect', () => {
    let called = 0;
    component.onResultSelection.subscribe(() => called++);

    const listDE = fixture.debugElement.query(By.directive(SearchResultListComponent));
    const listCmp = listDE.componentInstance as SearchResultListComponent;

    listCmp.onItemSelect.emit();

    expect(called).toBe(1);
  });

  it('should pass inputs down to children', () => {
    const occurrences: AnimalSearchResult[] = [
      { id: 1, name: 'Fox', binomial_name: 'Vulpes vulpes', thumbnail: 't.jpg', gbif_key: '1' },
      { id: 2, name: 'Owl', binomial_name: 'Strix aluco', thumbnail: 't2.jpg', gbif_key: '2' },
    ];

    fixture.componentRef.setInput('occurrences', occurrences);
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();

    const searchFormDE = fixture.debugElement.query(By.directive(SearchFormComponent));
    const searchFormCmp = searchFormDE.componentInstance as SearchFormComponent;

    const listDE = fixture.debugElement.query(By.directive(SearchResultListComponent));
    const listCmp = listDE.componentInstance as SearchResultListComponent;

    expect(searchFormCmp.isActive()).toBeTrue();
    expect(listCmp.isLoading()).toBeTrue();
    expect(listCmp.list()).toEqual(occurrences);
  });
});
