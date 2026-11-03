import { describe, beforeEach, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  PRIVACY_CONTACT_EMAIL,
  PrivacyComponent,
} from './privacy.component';

describe('PrivacyComponent', () => {
  let fixture: ComponentFixture<PrivacyComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  it('renders every privacy section', () => {
    for (const section of [
      'privacy-stored',
      'privacy-visibility',
      'privacy-not-stored',
      'privacy-device',
      'privacy-services',
      'privacy-rights',
    ]) {
      expect(
        element.querySelector(`[data-test-id="${section}"]`),
      ).toBeTruthy();
    }
  });

  it('links the contact email', () => {
    const link = element.querySelector<HTMLAnchorElement>(
      '[data-test-id="privacy-contact"]',
    );

    expect(link?.getAttribute('href')).toBe(`mailto:${PRIVACY_CONTACT_EMAIL}`);
    expect(link?.textContent?.trim()).toBe(PRIVACY_CONTACT_EMAIL);
  });
});
