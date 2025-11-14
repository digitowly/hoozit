import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { SearchFormComponent } from './search-form.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

describe('SearchFormComponent', () => {
  let component: SearchFormComponent;
  let fixture: ComponentFixture<SearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFormComponent);
    await fixture.whenStable();
    component = fixture.componentInstance;

    vi.spyOn(component as any, 'validateTerm').mockImplementation((term) => {
      return of(term);
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onSearch when submitting a valid query', () => {
    const emitted: string[] = [];
    component.onSearch.subscribe((term: string) => emitted.push(term));

    component.searchForm.setValue({ query: 'eagle' });
    component.onSubmit();

    expect(emitted).toEqual(['eagle']);
  });

  it('should focus the input when isActive becomes true', () => {
    const inputEl: HTMLInputElement =
      fixture.nativeElement.querySelector('input');
    vi.spyOn(inputEl, 'focus');

    fixture.componentRef.setInput('isActive', true);
    fixture.detectChanges();

    expect(inputEl.focus).toHaveBeenCalled();
  });
});
