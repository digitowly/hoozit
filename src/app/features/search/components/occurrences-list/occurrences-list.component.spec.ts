import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrencesListComponent } from './occurrences-list.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('OccurrencesListComponent', () => {
  let component: OccurrencesListComponent;
  let fixture: ComponentFixture<OccurrencesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrencesListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrencesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
