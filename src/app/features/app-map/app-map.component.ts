import { Component, effect, signal } from '@angular/core';
import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { GbifOccurrenceService } from '../../services/gbif/gbif-occurrence/gbif-occurrence.service';
import { MapService, MapMarker } from '../../services/map/map-service';
import { LeafletService } from '../../services/map/leaflet/leaflet.service';
import { SearchResultSelectionService } from '../search/services/search-result-selection/search-result-selection.service';
import { Coordinate } from '../../model/coordinate';
import { GeoService } from '../../services/geo/geo.service';
import { AnimalSearchResult } from '../../services/animal-search/animal-search.model';
import { IconComponent } from '../../components/icon/icon.component';
import { FloatingButtonComponent } from '../../components/floating-button/floating-button.component';
import { ModalComponent } from '../../components/modal/modal.component';

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
  isModalOpen = signal(false);
  selectedMarker = signal<MapMarker | null>(null);

  private hasInitialCenter = signal(false);
  private lastSearchCoordinate: Coordinate | null = null;
  private lastSelections: AnimalSearchResult[] = [];

  constructor(
    private map: MapService,
    private userLocation: UserLocationService,
    private geo: GeoService,
    private gbifOccurrenceService: GbifOccurrenceService,
    private selectionService: SearchResultSelectionService,
  ) {
    this.userLocation.getLocation();
    const initialLocation = this.userLocation.coordinate();

    effect(() => {
      this.map.init(initialLocation, 13);
    });

    effect(() => {
      if (!this.userLocation.isValid()) return;

      const currentCoordinate = this.userLocation.coordinate();

      const locationChangedSignificantly =
        !this.lastSearchCoordinate ||
        this.geo.getDistance(currentCoordinate, this.lastSearchCoordinate) >=
          this.gbifOccurrenceService.CACHE_THRESHOLD_KM;

      if (
        !locationChangedSignificantly &&
        this.selectionService.hasIdenticalSelections(this.lastSelections)
      ) {
        return;
      }

      this.lastSelections = this.selectionService.selections();

      if (locationChangedSignificantly) {
        this.lastSearchCoordinate = currentCoordinate;
      }

      this.map.removeMarkers();

      for (const selection of this.selectionService.selections()) {
        const occurrences = this.gbifOccurrenceService.search(
          selection.gbif_key ?? '',
          this.userLocation.coordinate(),
        );
        occurrences.subscribe((species) => {
          species?.results.forEach((occurrence) => {
            console.log(occurrence);
            this.map.createMarker(
              {
                coordinate: {
                  latitude: occurrence.decimalLatitude,
                  longitude: occurrence.decimalLongitude,
                },
                icon: selection.thumbnail ?? '',
                content: {
                  title: selection.name,
                  scientificName: selection.binomial_name,
                  loyalty: occurrence.locality,
                  date: occurrence.eventDate,
                  institutionCode: occurrence.institutionCode,
                },
              },
              (marker) => {
                this.isModalOpen.set(true);
                this.selectedMarker.set(marker);
              },
            );
          });
        });
      }
      this.map.repaintUserMarker(this.userLocation.coordinate());
    });

    effect(() => {
      if (userLocation.isValid() && !this.hasInitialCenter()) {
        this.map.setCenter(this.userLocation.coordinate());
        this.hasInitialCenter.set(true);
      }
    });

    effect(() => {
      if (!this.userLocation.isValid()) return;
      this.map.repaintUserMarker(this.userLocation.coordinate());
    });
  }

  centerToUserLocation() {
    this.map.setCenter(this.userLocation.coordinate());
  }
}
