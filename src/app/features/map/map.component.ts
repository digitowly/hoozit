import { Component } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  ngAfterViewInit() {
    const map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(
      map
    );
  }
}
