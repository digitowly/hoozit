import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { OccurrencesViewComponent } from './occurrences-view.component';
import { UserOccurrencesService } from '../../../services/occurrence/user-occurrences/user-occurrences.service';

describe('OccurrencesViewComponent', () => {
  let component: OccurrencesViewComponent;
  let fixture: ComponentFixture<OccurrencesViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrencesViewComponent],
      providers: [
        provideRouter([]),
        {
          provide: UserOccurrencesService,
          useValue: {
            resource: {
              value: signal([]),
              status: signal('resolved'),
              reload: () => false,
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrencesViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
