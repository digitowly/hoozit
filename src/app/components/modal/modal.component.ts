import {NgClass} from '@angular/common';
import {Component, effect, input, output} from '@angular/core';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  imports: [NgClass, IconComponent],
})
export class ModalComponent {
  title = input('');
  isOpen = input(false);
  readonly handleClose = output();

  constructor() {
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

  close() {
    this.handleClose.emit();
  }
}
