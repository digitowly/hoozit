import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { SearchResultSelectionListComponent } from './search-result-selection-list.component';
import { localStorageMock } from '../../../../../mock/localStorage';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';
import { ClientStorageKey } from '../../../../services/client-storage/client-storage.service';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';

describe('SearchResultSelectionListComponent', () => {
  let component: SearchResultSelectionListComponent;
  let fixture: ComponentFixture<SearchResultSelectionListComponent>;
  let selectionService: SearchResultSelectionService;

  const savedResults: AnimalSearchResult[] = [
    'Red fox',
    'Barn owl',
    'Brown hare',
    'Roe deer',
  ].map((name, index) => ({
    id: index + 1,
    name,
    binomial_name: name,
    taxonKey: String(index + 1),
    thumbnail: '',
  }));

  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: { ...localStorageMock },
    });
    localStorage.removeItem(ClientStorageKey.SEARCH_SELECTIONS);

    await TestBed.configureTestingModule({
      imports: [SearchResultSelectionListComponent],
    }).compileComponents();

    selectionService = TestBed.inject(SearchResultSelectionService);
    fixture = TestBed.createComponent(SearchResultSelectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it.each([1, 2])(
    'opens %i saved results automatically and still allows manual toggling',
    async (count) => {
      selectionService.selections.set(savedResults.slice(0, count));
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelectorAll('.item')).toHaveLength(
        count,
      );
      const toggle = fixture.nativeElement.querySelector('.toggle-button');
      const firstThumbnail = fixture.nativeElement.querySelector('.item img');
      expect(toggle.getAttribute('aria-expanded')).toBe('true');

      toggle.click();
      await fixture.whenStable();
      const panel = fixture.nativeElement.querySelector('.list-expanded');
      expect(panel.hasAttribute('inert')).toBe(true);
      expect(panel.getAttribute('aria-hidden')).toBe('true');
      expect(fixture.nativeElement.querySelector('.item img')).toBe(
        firstThumbnail,
      );
      expect(toggle.getAttribute('aria-expanded')).toBe('false');

      toggle.click();
      await fixture.whenStable();
      expect(panel.hasAttribute('inert')).toBe(false);
      expect(panel.getAttribute('aria-hidden')).toBe('false');
      expect(fixture.nativeElement.querySelector('.item img')).toBe(
        firstThumbnail,
      );
      expect(fixture.nativeElement.querySelectorAll('.item')).toHaveLength(
        count,
      );
    },
  );

  it('collapses at three results and automatically opens again below three', async () => {
    savedResults
      .slice(0, 2)
      .forEach((result) => selectionService.addSelection(result));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.item')).toHaveLength(2);

    selectionService.addSelection(savedResults[2]);
    await fixture.whenStable();
    expect(
      fixture.nativeElement
        .querySelector('.list-expanded')
        .hasAttribute('inert'),
    ).toBe(true);
    expect(
      fixture.nativeElement.querySelectorAll('.list-expanded img'),
    ).toHaveLength(3);

    selectionService.removeSelection(savedResults[2].id);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.item')).toHaveLength(2);
    expect(
      fixture.nativeElement
        .querySelector('.toggle-button')
        .getAttribute('aria-expanded'),
    ).toBe('true');
  });

  it('removes a saved result through the dock', async () => {
    selectionService.selections.set(savedResults.slice(0, 2));
    await fixture.whenStable();

    fixture.nativeElement.querySelector('.item-remove-button').click();
    await fixture.whenStable();

    expect(selectionService.selections()).toEqual([savedResults[1]]);
    expect(
      fixture.nativeElement.querySelector('.item-label').textContent,
    ).toContain('Barn owl');
  });

  it('preserves manual expansion when a larger list grows', async () => {
    selectionService.selections.set(savedResults.slice(0, 3));
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.toggle-button').click();
    await fixture.whenStable();

    selectionService.addSelection(savedResults[3]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.item')).toHaveLength(4);
    expect(
      fixture.nativeElement
        .querySelector('.toggle-button')
        .getAttribute('aria-expanded'),
    ).toBe('true');
  });
});
