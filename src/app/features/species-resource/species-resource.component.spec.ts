import { describe, beforeEach, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesResourceComponent } from './species-resource.component';

describe('SpeciesResourceComponent', () => {
  let component: SpeciesResourceComponent;
  let fixture: ComponentFixture<SpeciesResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeciesResourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeciesResourceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
