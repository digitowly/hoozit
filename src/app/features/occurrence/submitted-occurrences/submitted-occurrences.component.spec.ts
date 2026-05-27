import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedOccurrencesComponent } from './submitted-occurrences.component';

describe('SubmittedOccurrencesComponent', () => {
  let component: SubmittedOccurrencesComponent;
  let fixture: ComponentFixture<SubmittedOccurrencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmittedOccurrencesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubmittedOccurrencesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
