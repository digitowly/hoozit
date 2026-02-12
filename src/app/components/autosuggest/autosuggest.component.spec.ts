import { describe, beforeEach, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutosuggestComponent } from './autosuggest.component';

describe('AutosuggestComponent', () => {
  let component: AutosuggestComponent;
  let fixture: ComponentFixture<AutosuggestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutosuggestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AutosuggestComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
