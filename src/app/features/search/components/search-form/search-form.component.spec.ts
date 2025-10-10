import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchFormComponent } from './search-form.component';

describe('SearchFormComponent', () => {
  let component: SearchFormComponent;
  let fixture: ComponentFixture<SearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onSearch after debounce when typing a valid query', fakeAsync(() => {
    const emitted: string[] = [];
    component.onSearch.subscribe((term: string) => emitted.push(term));

    component.searchForm.setValue({ query: 'owl' });

    tick(300);

    expect(emitted).toEqual(['owl']);
  }));

  it('should emit onSearch when submitting a valid query', () => {
    const emitted: string[] = [];
    component.onSearch.subscribe((term: string) => emitted.push(term));

    component.searchForm.setValue({ query: 'eagle' });
    component.onSubmit();

    expect(emitted).toEqual(['eagle']);
  });

  it('should focus the input when isActive becomes true', () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input');
    spyOn(inputEl, 'focus');

    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();

    expect(inputEl.focus).toHaveBeenCalled();
  });
});
