import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceSearchFormComponent } from './occurrence-search-form.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('OccurrenceSearchFormComponent', () => {
  let component: OccurrenceSearchFormComponent;
  let fixture: ComponentFixture<OccurrenceSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceSearchFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
