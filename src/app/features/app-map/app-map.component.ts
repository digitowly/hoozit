import { Component, effect, signal } from '@angular/core';
import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { MapService, MapMarker } from '../../services/map/map-service';
import { LeafletService } from '../../services/map/leaflet/leaflet.service';
import { IconComponent } from '../../components/icon/icon.component';
import { FloatingButtonComponent } from '../../components/floating-button/floating-button.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { OccurrenceMarkerService } from './services/occurrence-marker/occurrence-marker.service';

@Component({
  selector: 'app-map',
  imports: [IconComponent, FloatingButtonComponent, ModalComponent],
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
  readonly isModalOpen = signal(false);
  readonly selectedMarker = signal<MapMarker | null>(null);

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
              this.isModalOpen.set(true);
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
}
