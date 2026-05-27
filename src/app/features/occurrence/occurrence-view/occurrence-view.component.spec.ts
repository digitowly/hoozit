import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceViewComponent } from './occurrence-view.component';

describe('OccurrenceViewComponent', () => {
  let component: OccurrenceViewComponent;
  let fixture: ComponentFixture<OccurrenceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
