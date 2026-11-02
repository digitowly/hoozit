import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFormComponent } from './search-form.component';
import { provideZonelessChangeDetection } from '@angular/core';

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

  it('handles input events from typing or pasting without waiting for keyup', () => {
    const emitted = vi.fn();
    component.onSearch.subscribe(emitted);
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'owl';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(emitted).toHaveBeenCalledExactlyOnceWith('owl');
  });

  it('clears the query and parent state while loading, without submitting again', async () => {
    component.query.setValue('owl');
    fixture.componentRef.setInput('isLoading', true);
    await fixture.whenStable();
    const search = vi.fn();
    const changed = vi.fn();
    component.onSearch.subscribe(search);
    component.onSearchTermChange.subscribe(changed);
    const input = fixture.nativeElement.querySelector('input');
    const focus = vi.spyOn(input, 'focus');

    fixture.nativeElement.querySelector('.search-form-clear-button').click();
    await fixture.whenStable();

    expect(input.value).toBe('');
    expect(search).toHaveBeenCalledExactlyOnceWith('');
    expect(changed).toHaveBeenCalledExactlyOnceWith('');
    expect(focus).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.search-spinner')).toBeNull();
  });

  it('does not submit a short or whitespace-only query', () => {
    const search = vi.fn();
    component.onSearch.subscribe(search);
    for (const term of ['  ', ' ow ']) {
      component.query.setValue(term);
      component.onSubmit();
    }
    expect(search).not.toHaveBeenCalled();
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
