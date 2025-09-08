import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceSearchFormComponent } from './occurrence-search-form.component';

describe('OccurrenceSearchFormComponent', () => {
  let component: OccurrenceSearchFormComponent;
  let fixture: ComponentFixture<OccurrenceSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceSearchFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
