import { NgClass, DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ApplicationRef,
  Component,
  computed,
  effect,
  EmbeddedViewRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ImageSource } from '../../model/image';
import { ModalService } from '../../services/modal/modal.service';

type ModalType = 'large' | 'compact';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  standalone: true,
  imports: [NgClass, IconComponent],
})
export class ModalComponent implements OnDestroy {
  readonly modalType = input<ModalType>('large');
  readonly modalId = input.required<string>();
  readonly title = input('');
  readonly heroImage = input<ImageSource | null>(null);
  readonly isLoading = input(false);

  readonly handleClose = output();

  private readonly modalService = inject(ModalService);
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);

  readonly open = computed(() => this.modalService.isOpen(this.modalId()));

  @ViewChild('modalTemplate') private modalTemplate!: TemplateRef<void>;
  private viewRef?: EmbeddedViewRef<void>;
  private containerEl?: HTMLElement;

  private readonly viewReady = signal(false);

  constructor() {
    afterNextRender(() => this.viewReady.set(true));

    effect((onCleanup) => {
      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.open()) {
          this.close();
        }
      };
      window.addEventListener('keydown', handleKeydown);
      onCleanup(() => window.removeEventListener('keydown', handleKeydown));
    });

    effect((onCleanup) => {
      if (!this.viewReady()) return;
      if (this.open()) {
        this.attachView();
      } else {
        const id = setTimeout(() => this.cleanupView(), 400);
        onCleanup(() => clearTimeout(id));
      }
    });
  }

  close() {
    this.modalService.close(this.modalId());
    this.handleClose.emit();
  }

  ngOnDestroy() {
    this.cleanupView();
  }

  private attachView() {
    if (this.viewRef || !this.document.body || !this.modalTemplate) return;
    this.containerEl = this.document.createElement('div');
    this.document.body.appendChild(this.containerEl);
    this.viewRef = this.modalTemplate.createEmbeddedView(undefined);
    this.appRef.attachView(this.viewRef);
    this.viewRef.rootNodes.forEach((n) => this.containerEl!.appendChild(n));
  }

  private cleanupView() {
    if (this.viewRef) {
      this.appRef.detachView(this.viewRef);
      this.viewRef.destroy();
      this.viewRef = undefined;
    }
    this.containerEl?.remove();
    this.containerEl = undefined;
  }
}
