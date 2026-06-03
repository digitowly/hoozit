import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';

import { OccurrenceViewComponent } from './occurrence-view.component';
import { UserOccurrenceService } from '../../../services/occurrence/user-occurrences/user-occurrence.service';

describe('OccurrenceViewComponent', () => {
  let component: OccurrenceViewComponent;
  let fixture: ComponentFixture<OccurrenceViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceViewComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: 'test-id' }) } },
        {
          provide: UserOccurrenceService,
          useValue: { id: signal(''), resource: { value: () => undefined } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
