import { describe, beforeEach, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingButtonComponent } from './floating-button.component';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';

describe('FloatingButtonComponent', () => {
  let fixture: ComponentFixture<FloatingButtonComponent>;
  let component: FloatingButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingButtonComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit click when button is clicked', () => {
    const sub = component.click.subscribe(() => {
      sub.unsubscribe();
    });

    const buttonElement = fixture.debugElement.query(By.css('.floating-button'))
      .nativeElement as HTMLButtonElement;
    buttonElement.click();
  });
});
