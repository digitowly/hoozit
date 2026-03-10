import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldContainerComponent } from './field-container.component';

describe('FieldContainerComponent', () => {
  let component: FieldContainerComponent;
  let fixture: ComponentFixture<FieldContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldContainerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
