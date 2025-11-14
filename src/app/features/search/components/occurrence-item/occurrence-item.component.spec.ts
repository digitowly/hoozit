import { describe, beforeEach, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccurrenceItemComponent } from './occurrence-item.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('OccurrenceItemComponent', () => {
  let component: OccurrenceItemComponent;
  let fixture: ComponentFixture<OccurrenceItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OccurrenceItemComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(OccurrenceItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
