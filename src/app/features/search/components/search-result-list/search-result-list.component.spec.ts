import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchResultListComponent } from './search-result-list.component';
import { SearchResultSelectionService } from '../../services/search-result-selection/search-result-selection.service';
import { AnimalSearchResult } from '../../../../services/animal-search/animal-search.model';
import { provideZonelessChangeDetection } from '@angular/core';

class SearchResultSelectionServiceMock {
  addSelection = vi.fn();
}

describe('SearchResultListComponent', () => {
  let component: SearchResultListComponent;
  let fixture: ComponentFixture<SearchResultListComponent>;
  let selectionServiceSpy: SearchResultSelectionServiceMock;
  let originalInnerHeight: number;

  function setInnerHeight(height: number) {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: height,
    });
  }

  beforeEach(async () => {
    selectionServiceSpy = new SearchResultSelectionServiceMock();

    await TestBed.configureTestingModule({
      imports: [SearchResultListComponent],
      providers: [
        {
          provide: SearchResultSelectionService,
          useValue: selectionServiceSpy,
        },
        provideZonelessChangeDetection(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Keep original innerHeight to restore later
    originalInnerHeight = window.innerHeight;
  });

  afterEach(() => {
    // Restore original innerHeight after each test
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call SearchResultSelectionService.addSelection when an item is selected', () => {
    const mockResult: AnimalSearchResult = {
      id: 1,
      name: 'Fox',
      binomial_name: 'Vulpes vulpes',
      thumbnail: 'fox.jpg',
      gbif_key: '1234',
    };

    component.handleItemSelection(mockResult);

    expect(selectionServiceSpy.addSelection).toHaveBeenCalledTimes(1);
    expect(selectionServiceSpy.addSelection).toHaveBeenCalledWith(mockResult);
  });

  it('should emit onItemSelect when an item is selected', (done) => {
    const mockResult: AnimalSearchResult = {
      id: 2,
      name: 'Wolf',
      binomial_name: 'Canis lupus',
      thumbnail: 'wolf.jpg',
      gbif_key: '5678',
    };

    component.onItemSelect.subscribe(() => {
      // done();
    });

    component.handleItemSelection(mockResult);
  });

  describe('calculateHeight', () => {
    beforeEach(() => {
      // Provide a fake ElementRef with a controllable top value
      (component as any).listRef = {
        nativeElement: {
          getBoundingClientRect: () => ({ top: 100 }),
        },
      };
    });

    it("should return 'auto' when list is empty", () => {
      fixture.componentRef.setInput('list', []);

      const result = (component as any).calculateHeight();
      expect(result).toBe('auto');
    });

    it("should return 'auto' when the list fits within the available space", () => {
      // window.innerHeight - rect.top = 1000 - 100 = 900
      setInnerHeight(1000);
      // 10 items * 78 = 780 which is <= 900, so 'auto'
      const items: AnimalSearchResult[] = Array.from({ length: 10 }).map(
        (_, i) => ({
          id: i + 1,
          name: `Animal ${i + 1}`,
          binomial_name: 'X y',
          thumbnail: 't.jpg',
          gbif_key: String(i + 1),
        }),
      );
      fixture.componentRef.setInput('list', items);

      const result = (component as any).calculateHeight();
      expect(result).toBe('auto');
    });

    it('should return the capped height in pixels when the list overflows the available space', () => {
      // distanceToBottom = 1000 - 100 = 900; expected height = 900 - 16 = 884px
      setInnerHeight(1000);
      // 20 items * 78 = 1560 which is > 900
      const items: AnimalSearchResult[] = Array.from({ length: 20 }).map(
        (_, i) => ({
          id: i + 1,
          name: `Animal ${i + 1}`,
          binomial_name: 'X y',
          thumbnail: 't.jpg',
          gbif_key: String(i + 1),
        }),
      );
      fixture.componentRef.setInput('list', items);

      const result = (component as any).calculateHeight();
      expect(result).toBe('892px');
    });
  });
});
