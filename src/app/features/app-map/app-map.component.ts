import {Component, effect, signal} from '@angular/core';
import {UserLocationService} from '../../services/user/user-location/user-location.service';
import {GbifOccurrenceService} from '../../services/gbif/gbif-occurrence/gbif-occurrence.service';
import {MapService} from '../../services/map/map-service';
import {LeafletService} from '../../services/map/leaflet/leaflet.service';
import {SearchResultSelectionService} from '../search/services/search-result-selection/search-result-selection.service';
import {AnimalSearchService} from '../../services/animal-search/animal-search.service';

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
  constructor(
    private map: MapService,
    private userLocation: UserLocationService,
    private gbifOccurrenceService: GbifOccurrenceService,
    public animalSearch: AnimalSearchService,
    private searchResultSelection: SearchResultSelectionService
  ) {
    this.userLocation.getLocation();

    effect(() => {
      if (!this.userLocation.isValid()) return;
      this.map.init(this.userLocation.coordinate(), 13);

      this.map.removeMarkers();
      this.map.drawCircle(this.userLocation.coordinate());
      for (const selection of this.searchResultSelection.selections()) {
        console.log(selection);
        const occurrences = this.gbifOccurrenceService.search(
          selection.gbif_key ?? '',
          this.userLocation.coordinate()
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

      // if (this.map) {
      //   L.rectangle(
      //     [
      //       [
      //         this.userLocation.coordinate().latitude - 0.03,
      //         this.userLocation.coordinate().longitude - 0.03,
      //       ],
      //       [
      //         this.userLocation.coordinate().latitude + 0.03,
      //         this.userLocation.coordinate().longitude + 0.03,
      //       ],
      //     ],
      //     {
      //       color: '#00bb89ff',
      //       fillColor: '#00ffbbff',
      //       fillOpacity: 0.1,
      //     }
      //   ).addTo(this.map);
      // }
    });
  }
}
