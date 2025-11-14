import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleButtonComponent } from './toggle-button.component';
import { provideZonelessChangeDetection } from '@angular/core';

describe('ToggleButtonComponent', () => {
  let component: ToggleButtonComponent;
  let fixture: ComponentFixture<ToggleButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleButtonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
