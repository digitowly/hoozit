import { Component, effect, signal } from '@angular/core';
import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { GbifOccurrenceService } from '../../services/gbif/gbif-occurrence/gbif-occurrence.service';
import { MapService } from '../../services/map/map-service';
import { LeafletService } from '../../services/map/leaflet/leaflet.service';
import { SearchResultSelectionService } from '../search/services/search-result-selection/search-result-selection.service';

@Component({
  selector: 'app-map',
  imports: [],
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
  private hasInitialCenter = signal(false);

  constructor(
    private map: MapService,
    private userLocation: UserLocationService,
    private gbifOccurrenceService: GbifOccurrenceService,
    private searchResultSelection: SearchResultSelectionService,
  ) {
    this.userLocation.getLocation();
    const initialLocation = this.userLocation.coordinate();

    effect(() => {
      this.map.init(initialLocation, 13);
    });

    effect(() => {
      if (!this.userLocation.isValid()) return;
      this.map.removeMarkers();
      for (const selection of this.searchResultSelection.selections()) {
        console.log(selection);
        const occurrences = this.gbifOccurrenceService.search(
          selection.gbif_key ?? '',
          this.userLocation.coordinate(),
        );
        occurrences.subscribe((species) => {
          species?.results.forEach((occurrence) => {
            this.map.createMarker({
              coordinate: {
                latitude: occurrence.decimalLatitude,
                longitude: occurrence.decimalLongitude,
              },
              icon: selection.thumbnail ?? '',
              content: `<b>${occurrence.scientificName}</b><br/>${occurrence.country}<br/>`,
            });
          });
        });
      }
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
}
