import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { inputBinding, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { ModalService } from '../../services/modal/modal.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

describe('ModalComponent', () => {
  const TEST_ID = 'test-modal';

  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;
  let modalService: ModalService;

  const modalId = signal(TEST_ID);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent, {
      bindings: [inputBinding('modalId', modalId)],
    });

    modalService = TestBed.inject(ModalService);

    fixture.detectChanges();
    await fixture.whenStable();

    component = fixture.componentInstance;
  });

  afterEach(() => {
    modalService.closeAll();
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('open signal is false when modal is closed', () => {
    expect(component.open()).toBe(false);
  });

  it('open signal is true when modal is opened via service', () => {
    modalService.open(TEST_ID);
    expect(component.open()).toBe(true);
  });

  it('open signal returns to false after modal is closed via service', () => {
    modalService.open(TEST_ID);
    modalService.close(TEST_ID);
    expect(component.open()).toBe(false);
  });

  it('close() calls modalService.close and emits handleClose', () => {
    modalService.open(TEST_ID);
    let emitted = false;
    component.handleClose.subscribe(() => {
      emitted = true;
    });

    component.close();

    expect(emitted).toBe(true);
    expect(modalService.isOpen(TEST_ID)).toBe(false);
  });

  it('Escape key calls close() when modal is open', () => {
    modalService.open(TEST_ID);
    let emitted = false;
    component.handleClose.subscribe(() => {
      emitted = true;
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(emitted).toBe(true);
    expect(modalService.isOpen(TEST_ID)).toBe(false);
  });

  it('Escape key does not close when modal is not open', () => {
    let emitted = false;
    component.handleClose.subscribe(() => {
      emitted = true;
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(emitted).toBe(false);
  });

  it('closeAll() via service closes the modal', () => {
    modalService.open(TEST_ID);
    expect(component.open()).toBe(true);

    modalService.closeAll();
    expect(component.open()).toBe(false);
  });
});
