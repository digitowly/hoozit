import { NgClass, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  Inject,
  input,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { CdkPortal, DomPortalOutlet, PortalModule } from '@angular/cdk/portal';

type ModalType = 'large' | 'compact';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  standalone: true,
  imports: [NgClass, IconComponent, PortalModule],
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  modalType = input<ModalType>('large');

  title = input('');

  isOpen = input(false);

  readonly handleClose = output();

  @ViewChild(CdkPortal) portal!: CdkPortal;
  private portalHost?: DomPortalOutlet;

  constructor(@Inject(DOCUMENT) private document: Document) {
    effect((onCleanup) => {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      };

      window.addEventListener('keydown', handleKeydown);

      onCleanup(() => {
        window.removeEventListener('keydown', handleKeydown);
      });
    });
  }

  ngAfterViewInit() {
    // Attach this component's projected content to a global portal (document.body)
    if (!this.document.body || !this.portal) {
      return;
    }
    try {
      this.portalHost = new DomPortalOutlet(this.document.body);
      this.portalHost.attach(this.portal);
    } catch {
      // Swallow errors in non-DOM environments (e.g., some test runners/SSR)
    }
  }

  close() {
    this.handleClose.emit();
  }

  ngOnDestroy(): void {
    if (this.portalHost) {
      try {
        this.portalHost.detach();
      } catch {
        // ignore
      }
      this.portalHost = undefined;
    }
  }
}
