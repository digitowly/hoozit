import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { MapMarker } from '../../../services/map/map-service';

@Component({
  selector: 'occurrence-preview-modal',
  imports: [ModalComponent],
  templateUrl: './occurrence-preview-modal.component.html',
  styleUrl: './occurrence-preview-modal.component.scss',
})
export class OccurrencePreviewModalComponent {
  readonly modalId = input.required<string>();
  readonly marker = input<MapMarker | null>(null);
  readonly handleClose = output();
}
