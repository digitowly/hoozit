import { Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly openIds = signal<ReadonlySet<string>>(new Set());

  constructor(router: Router) {
    router.events
      .pipe(filter((e) => e instanceof NavigationStart))
      .subscribe(() => this.closeAll());
  }

  open(id: string): void {
    this.openIds.update((s) => new Set([...s, id]));
  }

  close(id: string): void {
    this.openIds.update((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  }

  closeAll(): void {
    this.openIds.set(new Set());
  }

  isOpen(id: string): boolean {
    return this.openIds().has(id);
  }
}
