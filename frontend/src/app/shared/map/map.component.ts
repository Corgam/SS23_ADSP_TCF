import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import XYZ from 'ol/source/XYZ';
import { CoordinateService } from './service/coordinate.service';
import { createStringXY } from 'ol/coordinate';

/**
 * Based on:
 * - https://openlayers.org/en/latest/examples/draw-and-modify-features.html; accessed: May 29, 2023; 11:37
 */
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @Output()
  coordinateSelected = new EventEmitter<[number, number]>();

  map!: Map;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<any>;
  overlay!: Overlay;

  constructor(private coordinateService: CoordinateService) {}

  ngOnInit() {
    this.initializeMap();
    this.initializeMarkerLayer();
    this.addClickListener();
  }
// Initializes the OpenLayers map with a tile layer and default view
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

  }
  // Initializes the vector layer for displaying markers on the map
  // https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html 
  initializeMarkerLayer() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,  
      style: {
        'circle-radius': 5,
        'circle-fill-color': '#FF0000',
      },
    });
    this.map.addLayer(this.vectorLayer);
  }
// Adds a click event listener to the map to handle marker placement
// https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html
// https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
// https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html#event:click
  addClickListener() {
    this.map.on('click', (event) => {
      const coordinate = event.coordinate;

      this.vectorSource.clear();

      const marker = new Feature({
        geometry: new Point(coordinate),
      });
      this.vectorSource.addFeature(marker);
    
      this.displayPopup(coordinate as [number, number]);

      this.coordinateService.setCoordinate(coordinate as [number, number]);
      this.coordinateSelected.emit(coordinate as [number, number]);
    });
  }
 // Displays a popup with the clicked coordinates
  displayPopup(coordinate: [number, number]) {
    const popupElement = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    if (popupElement && popupContent) {
      var transformedCoords = transform(coordinate, 'EPSG:3857', 'EPSG:4326');

      /** https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html; accessed: May 29, 2023 at 14:39 */
      const stringifyFunc = createStringXY(2);
      const out = stringifyFunc(transformedCoords);
      popupContent.innerHTML = `Coordinates: ${out}`;

      this.overlay = new Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10]
      });

      this.map.addOverlay(this.overlay);
      this.overlay.setPosition(coordinate);
    }
  }
}

