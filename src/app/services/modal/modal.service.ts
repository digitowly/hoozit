import { effect, inject, Injectable, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

type ModalType = 'large' | 'compact';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly openModals = signal<ReadonlyMap<string, ModalType>>(new Map());
  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.closeAll());

    effect(() => {
      const hasLarge = [...this.openModals().values()].some((t) => t === 'large');
      this.document.body.style.overflow = hasLarge ? 'hidden' : '';
    });
  }

  open(id: string, type: ModalType = 'large'): void {
    this.openModals.update((m) => new Map([...m, [id, type]]));
  }

  close(id: string): void {
    this.openModals.update((m) => {
      const next = new Map(m);
      next.delete(id);
      return next;
    });
  }

  closeAll(): void {
    this.openModals.set(new Map());
  }

  isOpen(id: string): boolean {
    return this.openModals().has(id);
  }
}
