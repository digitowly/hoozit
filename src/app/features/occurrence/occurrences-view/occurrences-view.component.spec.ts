import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrencesViewComponent } from './occurrences-view.component';

describe('OccurrencesViewComponent', () => {
  let component: OccurrencesViewComponent;
  let fixture: ComponentFixture<OccurrencesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrencesViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrencesViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
