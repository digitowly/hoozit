import { beforeEach, describe, expect, it } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesOverviewModalComponent } from './species-overview-modal.component';

describe('SpeciesOverviewModalComponent', () => {
  let component: SpeciesOverviewModalComponent;
  let fixture: ComponentFixture<SpeciesOverviewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpeciesOverviewModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SpeciesOverviewModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
