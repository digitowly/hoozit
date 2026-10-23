import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

type ModalType = 'large' | 'compact';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly activeModal = signal<{ id: string; type: ModalType } | null>(
    null,
  );
  private readonly document = inject(DOCUMENT);

  readonly hasOpenModal = computed(() => this.activeModal() !== null);

  constructor() {
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.closeAll());

    effect(() => {
      this.document.body.style.overflow =
        this.activeModal()?.type === 'large' ? 'hidden' : '';
    });
  }

  open(id: string, type: ModalType = 'large'): void {
    this.activeModal.set({ id, type });
  }

  close(id: string): void {
    this.activeModal.update((modal) => (modal?.id === id ? null : modal));
  }

  closeAll(): void {
    this.activeModal.set(null);
  }

  isOpen(id: string): boolean {
    return this.activeModal()?.id === id;
  }
}
