import { Component, computed, effect, inject, signal } from '@angular/core';
import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { MapService, MapMarker } from '../../services/map/map-service';
import { LeafletService } from '../../services/map/leaflet/leaflet.service';
import { IconComponent } from '../../components/icon/icon.component';
import { OccurrenceMarkerService } from './services/occurrence-marker/occurrence-marker.service';
import { ModalService } from '../../services/modal/modal.service';
import { OccurrencePreviewModalComponent } from '../modals/occurrence-preview-modal/occurrence-preview-modal.component';
import { LogOccurrenceModalComponent } from '../modals/log-occurrence-modal/log-occurrence-modal.component';

const MODAL_ID = 'map-marker';
const LOG_OCCURRENCE_MODAL_ID = 'log-occurrence';

@Component({
  selector: 'app-map',
  imports: [IconComponent, OccurrencePreviewModalComponent, LogOccurrenceModalComponent],
  providers: [
    {
      provide: MapService,
      useClass: LeafletService,
    },
  ],
  templateUrl: './app-map.component.html',
  styleUrl: './app-map.component.scss',
})
export class AppMapComponent {
  readonly modalId = MODAL_ID;
  readonly logOccurrenceModalId = LOG_OCCURRENCE_MODAL_ID;
  readonly selectedMarker = signal<MapMarker | null>(null);

  private readonly modalService = inject(ModalService);

  readonly isModalOpen = computed(() => this.modalService.isOpen(this.modalId));
  readonly isLogOccurrenceModalOpen = computed(() => this.modalService.isOpen(this.logOccurrenceModalId));
  readonly isAnyModalOpen = computed(() => this.isModalOpen() || this.isLogOccurrenceModalOpen());

  private hasInitialCenter = signal(false);

  constructor(
    private mapService: MapService,
    private userLocation: UserLocationService,
    private markerService: OccurrenceMarkerService,
  ) {
    this.userLocation.getLocation();
    const initialLocation = this.userLocation.coordinate();

    effect(() => {
      this.mapService.init(initialLocation, 13);
    });

    effect(() => {
      if (!this.userLocation.isValid()) return;

      this.markerService
        .createMarkers(
          this.mapService,
          this.userLocation.coordinate(),
          (marker) => {
            this.mapService.createMarker(marker, (marker) => {
              this.modalService.open(this.modalId, 'compact');
              this.selectedMarker.set(marker);
            });
          },
        )
        .subscribe();
    });

    effect(() => {
      if (userLocation.isValid() && !this.hasInitialCenter()) {
        this.mapService.setCenter(this.userLocation.coordinate());
        this.hasInitialCenter.set(true);
      }
    });

    effect(() => {
      if (!this.userLocation.isValid()) return;
      this.mapService.repaintUserMarker(this.userLocation.coordinate());
    });
  }

  centerToUserLocation() {
    this.mapService.setCenter(this.userLocation.coordinate());
  }

  openLogOccurrenceModal() {
    this.modalService.open(this.logOccurrenceModalId);
  }
}
