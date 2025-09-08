import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrencesListComponent } from './occurrences-list.component';

describe('OccurrencesListComponent', () => {
  let component: OccurrencesListComponent;
  let fixture: ComponentFixture<OccurrencesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrencesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccurrencesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
