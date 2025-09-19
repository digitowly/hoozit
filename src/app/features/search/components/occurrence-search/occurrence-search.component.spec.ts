import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceSearchComponent } from './occurrence-search.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('OccurrenceSearchComponent', () => {
  let component: OccurrenceSearchComponent;
  let fixture: ComponentFixture<OccurrenceSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceSearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
