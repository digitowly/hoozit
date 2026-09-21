import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { SubmissionStatus } from '../../../../services/occurrence/occurrence.model';
import { OccurrenceValidationIndicatorsComponent } from './validation-indicators.component';

describe('OccurrenceValidationIndicatorsComponent', () => {
  let fixture: ComponentFixture<OccurrenceValidationIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceValidationIndicatorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceValidationIndicatorsComponent);
    fixture.componentRef.setInput('status', SubmissionStatus.IN_REVIEW);
    fixture.detectChanges();
  });

  it.each([
    [SubmissionStatus.IN_REVIEW, 0],
    [SubmissionStatus.NAME_VERIFIED, 1],
    [SubmissionStatus.GEO_CONTINENT_VERIFIED, 2],
    [SubmissionStatus.GEO_COUNTRY_VERIFIED, 2],
    [SubmissionStatus.GEO_REGION_VERIFIED, 3],
    [SubmissionStatus.GEO_LOCALITY_VERIFIED, 4],
    [SubmissionStatus.VERIFIED, 4],
  ])('renders %s with %i completed steps', (status, completedSteps) => {
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll('.validation-step--complete'),
    ).toHaveLength(completedSteps);
    expect(
      fixture.nativeElement
        .querySelector('.validation-progress')
        .getAttribute('aria-valuenow'),
    ).toBe(String(completedSteps));
  });

  it('renders checks for complete steps and crosses for false steps', () => {
    fixture.componentRef.setInput(
      'status',
      SubmissionStatus.GEO_CONTINENT_VERIFIED,
    );
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll(
        '.validation-step--complete app-icon[name="check"]',
      ),
    ).toHaveLength(2);
    expect(
      fixture.nativeElement.querySelectorAll(
        '.validation-step:not(.validation-step--complete) app-icon[name="cross"]',
      ),
    ).toHaveLength(2);
  });
});
