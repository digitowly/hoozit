import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
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
  let additionalFixtures: ComponentFixture<ModalComponent>[];

  const title = signal('');
  const modalId = signal(TEST_ID);
  const modalType = signal<'large' | 'compact'>('large');
  const hasBackdrop = signal<boolean | undefined>(undefined);

  beforeEach(async () => {
    additionalFixtures = [];
    title.set('');
    modalType.set('large');
    hasBackdrop.set(undefined);
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent, {
      bindings: [
        inputBinding('modalId', modalId),
        inputBinding('title', title),
        inputBinding('modalType', modalType),
        inputBinding('hasBackdrop', hasBackdrop),
      ],
    });

    modalService = TestBed.inject(ModalService);

    fixture.detectChanges();
    await fixture.whenStable();

    component = fixture.componentInstance;
  });

  afterEach(() => {
    modalService.closeAll();
    additionalFixtures.forEach((otherFixture) => otherFixture.destroy());
    fixture.destroy();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('provides an accessible dialog name and close control', async () => {
    title.set('Visibility settings');
    modalService.open(TEST_ID);
    await fixture.whenStable();
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('id')).toBe(TEST_ID);
    expect(dialog?.getAttribute('aria-label')).toBe('Visibility settings');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(
      dialog?.querySelector('.close-button')?.getAttribute('aria-label'),
    ).toBe('Close dialog');
  });

  it.each(['large', 'compact'] as const)(
    'keeps the title and close control outside the scrolling content in a %s modal',
    async (type) => {
      modalType.set(type);
      title.set('Observation details');
      modalService.open(TEST_ID, type);
      await fixture.whenStable();

      const dialog = document.querySelector('.modal')!;
      const header = dialog.querySelector('.header')!;
      expect(header.querySelector('h2')?.textContent).toBe(
        'Observation details',
      );
      expect(header.querySelector('.close-button')).toBeTruthy();
      expect(dialog.querySelector('.content .header-title')).toBeNull();
      expect(dialog.querySelectorAll('h2')).toHaveLength(1);
    },
  );

  it('shows the header fade only after scrolling and clears it at the top', async () => {
    modalService.open(TEST_ID);
    await fixture.whenStable();
    const header = document.querySelector('.modal .header')!;
    const content = document.querySelector<HTMLElement>('.modal .content')!;
    expect(header.classList.contains('scrolled')).toBe(false);

    content.scrollTop = 80;
    content.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(header.classList.contains('scrolled')).toBe(true);

    content.scrollTop = 0;
    content.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(header.classList.contains('scrolled')).toBe(false);
  });

  it('starts a newly opened panel without the previous scroll fade', async () => {
    await createAnotherModal('compact');
    modalService.open(TEST_ID);
    await fixture.whenStable();
    const content = document.querySelector<HTMLElement>('.modal .content')!;
    content.scrollTop = 80;
    content.dispatchEvent(new Event('scroll'));
    await fixture.whenStable();

    modalService.open('other-modal', 'compact');
    await fixture.whenStable();
    modalService.open(TEST_ID);
    await fixture.whenStable();

    expect(document.querySelector('.modal .header.scrolled')).toBeNull();
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

  it.each(['large', 'compact'] as const)(
    'closes a %s modal and emits handleClose when its enabled backdrop is clicked',
    async (type) => {
      modalType.set(type);
      hasBackdrop.set(true);
      const closed = vi.fn();
      component.handleClose.subscribe(closed);
      modalService.open(TEST_ID, type);
      await fixture.whenStable();

      document.querySelector<HTMLElement>('.backdrop')!.click();
      await fixture.whenStable();

      expect(modalService.hasOpenModal()).toBe(false);
      expect(closed).toHaveBeenCalledOnce();
      expect(document.querySelector('.backdrop.closed')).toBeTruthy();
    },
  );

  it.each([
    ['compact', undefined],
    ['compact', false],
    ['large', false],
  ] as const)(
    'omits the backdrop for %s with hasBackdrop=%s',
    async (type, value) => {
      modalType.set(type);
      hasBackdrop.set(value);
      modalService.open(TEST_ID, type);
      await fixture.whenStable();

      expect(document.querySelector('.modal')).toBeTruthy();
      expect(document.querySelector('.backdrop')).toBeNull();
    },
  );

  it('does not close when clicking inside a modal with a backdrop', async () => {
    modalType.set('compact');
    hasBackdrop.set(true);
    modalService.open(TEST_ID, 'compact');
    await fixture.whenStable();

    document.querySelector<HTMLElement>('.modal .content')!.click();

    expect(component.open()).toBe(true);
    expect(document.querySelector('.backdrop')).toBeTruthy();
  });

  it('removes an opted-in backdrop when switching to a default compact modal', async () => {
    modalType.set('compact');
    hasBackdrop.set(true);
    await createAnotherModal('compact');
    modalService.open(TEST_ID, 'compact');
    await fixture.whenStable();
    expect(document.querySelectorAll('.backdrop')).toHaveLength(1);

    modalService.open('other-modal', 'compact');
    await fixture.whenStable();

    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.querySelector('.backdrop')).toBeNull();
  });

  it.each([
    ['compact', 'compact'],
    ['compact', 'large'],
    ['large', 'compact'],
    ['large', 'large'],
  ] as const)(
    'removes the previous %s panel when opening a %s modal',
    async (previousType, nextType) => {
      modalType.set(previousType);
      await createAnotherModal(nextType);

      modalService.open(TEST_ID, previousType);
      await fixture.whenStable();
      expect(document.querySelectorAll('.modal')).toHaveLength(1);

      modalService.open('other-modal', nextType);
      await fixture.whenStable();

      expect(document.querySelectorAll('.modal')).toHaveLength(1);
      expect(document.querySelector('.modal')?.textContent).toContain(
        'Other modal',
      );
      expect(document.querySelectorAll('.backdrop')).toHaveLength(
        nextType === 'large' ? 1 : 0,
      );
      expect(component.open()).toBe(false);
    },
  );

  it('preserves the closing animation when dismissing the last modal', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    modalService.open(TEST_ID);
    TestBed.tick();
    modalService.close(TEST_ID);
    TestBed.tick();

    expect(document.querySelector('.modal.closed')).toBeTruthy();
    expect(document.querySelector('.backdrop.closed')).toBeTruthy();
    vi.advanceTimersByTime(400);
    expect(document.querySelector('.modal')).toBeNull();
    expect(document.querySelector('.backdrop')).toBeNull();
  });

  it('cancels pending cleanup when reopening the same modal', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    modalService.open(TEST_ID);
    TestBed.tick();
    modalService.close(TEST_ID);
    TestBed.tick();
    vi.advanceTimersByTime(100);

    modalService.open(TEST_ID);
    TestBed.tick();
    vi.advanceTimersByTime(400);

    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.querySelector('.modal.closed')).toBeNull();
    expect(document.querySelectorAll('.backdrop')).toHaveLength(1);
    expect(document.querySelector('.backdrop.closed')).toBeNull();
  });

  it('removes an animating closed panel when another modal opens', async () => {
    await createAnotherModal('compact');
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    modalService.open(TEST_ID);
    TestBed.tick();
    modalService.close(TEST_ID);
    TestBed.tick();
    expect(document.querySelector('.modal.closed')).toBeTruthy();

    modalService.open('other-modal', 'compact');
    TestBed.tick();

    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.querySelector('.modal.closed')).toBeNull();
    vi.advanceTimersByTime(400);
    expect(document.querySelector('.modal')?.textContent).toContain(
      'Other modal',
    );
  });

  it('keeps one panel after rapidly switching back to the first modal', async () => {
    await createAnotherModal('compact');
    modalService.open(TEST_ID);
    await fixture.whenStable();
    modalService.open('other-modal', 'compact');
    await fixture.whenStable();
    modalService.open(TEST_ID);
    await fixture.whenStable();

    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.querySelectorAll('.backdrop')).toHaveLength(1);
    expect(document.querySelector('.modal')?.textContent).not.toContain(
      'Other modal',
    );
  });

  it('clears active registration and panel on destruction', () => {
    modalService.open(TEST_ID);
    TestBed.tick();
    fixture.destroy();
    TestBed.tick();

    expect(modalService.hasOpenModal()).toBe(false);
    expect(document.querySelector('.modal')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not close the replacement when the previous component is destroyed', async () => {
    await createAnotherModal('large');
    modalService.open(TEST_ID);
    await fixture.whenStable();
    modalService.open('other-modal');
    await fixture.whenStable();
    fixture.destroy();
    TestBed.tick();

    expect(modalService.isOpen('other-modal')).toBe(true);
    expect(document.querySelectorAll('.modal')).toHaveLength(1);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('closes only the replacement modal when Escape is pressed', async () => {
    const otherFixture = await createAnotherModal('compact');
    const previousClosed = vi.fn();
    const replacementClosed = vi.fn();
    component.handleClose.subscribe(previousClosed);
    otherFixture.componentInstance.handleClose.subscribe(replacementClosed);
    modalService.open(TEST_ID);
    await fixture.whenStable();
    modalService.open('other-modal', 'compact');
    await fixture.whenStable();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(previousClosed).not.toHaveBeenCalled();
    expect(replacementClosed).toHaveBeenCalledOnce();
    expect(modalService.hasOpenModal()).toBe(false);
  });

  async function createAnotherModal(type: 'large' | 'compact') {
    const otherFixture = TestBed.createComponent(ModalComponent);
    additionalFixtures.push(otherFixture);
    otherFixture.componentRef.setInput('modalId', 'other-modal');
    otherFixture.componentRef.setInput('modalType', type);
    otherFixture.componentRef.setInput('title', 'Other modal');
    otherFixture.detectChanges();
    await otherFixture.whenStable();
    return otherFixture;
  }
});
