import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map!: Map;
  popup!: Overlay;

  ngOnInit() {
    this.initializeMap();
  }

  initializeMap() {
    const rasterLayer = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    });

    this.map = new Map({
      target: 'map',
      layers: [rasterLayer],
      view: new View({
        center: fromLonLat([13.404954, 52.520008]), // Berlin coordinates
        zoom: 12
      })
    });

    this.popup = new Overlay({
      element: document.getElementById('popup')!,
      positioning: 'bottom-center',
      stopEvent: false
    });

    this.map.addOverlay(this.popup);

    this.map.on('click', (event) => {
      const coordinate = event.coordinate;
      const hdms = toStringHDMS(coordinate);

      this.popup.setPosition(coordinate);
      document.getElementById('popup-content')!.innerHTML = hdms;
    });
  }
}
