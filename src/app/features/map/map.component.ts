import { Component, effect, inject } from '@angular/core';
import * as L from 'leaflet';
import { UserLocationService } from '../../services/user/user-location/user-location.service';
import { ActiveOccurrenceService } from '../../services/active-occurrence/active-occurrence.service';
import { GbifOccurrenceService } from '../../services/gbif/gbif-occurrence/gbif-occurrence.service';

@Component({
  selector: 'map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  private map: L.Map | null = null;

  constructor(
    private userLocation: UserLocationService,
    private gbifOccurrenceService: GbifOccurrenceService,
    private activeOccurrenceService: ActiveOccurrenceService
  ) {
    effect(() => {
      this.userLocation.getLocation();
    });

    effect(() => {
      if (this.userLocation.coordinate()) {
        this.initMap();
      }
    });

    effect(() => {
      // remove markers
      if (!this.map) {
        return;
      }
      this.map.eachLayer((layer) => {
        if ((layer as L.Marker).getLatLng) {
          this.map?.removeLayer(layer);
        }
      });

      const activeOccurrence =
        this.activeOccurrenceService.getActiveOccurrence();
      const test = this.gbifOccurrenceService.getOccurrences(
        activeOccurrence?.gbif_key ?? '',
        {
          latitude: this.userLocation.coordinate().latitude,
          longitude: this.userLocation.coordinate().longitude,
        }
      );
      console.log('Active occurrence changed:', activeOccurrence);
      test.subscribe((species) => {
        console.log('Species:', species);

        species?.results.forEach((occurrence) => {
          if (this.map) {
            L.marker([occurrence.decimalLatitude, occurrence.decimalLongitude])
              .addTo(this.map)
              .setIcon(
                L.icon({
                  className: 'marker-icon',
                  iconUrl: activeOccurrence?.thumbnail ?? '',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41],
                })
              )
              .bindPopup(
                `<b>${occurrence.scientificName}</b><br/>${occurrence.country}`
              );
          }
        });
      });
    });
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }
    this.map = L.map('map').setView(
      [
        this.userLocation.coordinate().latitude,
        this.userLocation.coordinate().longitude,
      ],
      17
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      this.map
    );
  }
}
