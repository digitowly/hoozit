import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { SearchResultSelectionListComponent } from './search-result-selection-list.component';
import { localStorageMock } from '../../../../../mock/localStorage';

describe('SearchResultSelectionListComponent', () => {
  let component: SearchResultSelectionListComponent;
  let fixture: ComponentFixture<SearchResultSelectionListComponent>;

  beforeEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: { ...localStorageMock },
    });

    await TestBed.configureTestingModule({
      imports: [SearchResultSelectionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultSelectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
