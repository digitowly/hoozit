import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceItemComponent } from './occurrence-item.component';

describe('OccurrenceItemComponent', () => {
  let component: OccurrenceItemComponent;
  let fixture: ComponentFixture<OccurrenceItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
