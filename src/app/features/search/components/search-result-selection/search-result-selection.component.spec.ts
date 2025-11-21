import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { SearchResultSelectionComponent } from './search-result-selection.component';

describe('SearchResultSelectionComponent', () => {
  let component: SearchResultSelectionComponent;
  let fixture: ComponentFixture<SearchResultSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
