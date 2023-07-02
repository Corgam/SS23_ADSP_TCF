import { Component, EventEmitter, OnInit, Output, AfterViewInit } from '@angular/core';
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
import { createStringXY } from 'ol/coordinate';
import { Circle, Fill, Style } from 'ol/style';
import { CoordinateService } from '../shared/upload-map/service/coordinate.service';
import { ApiService } from '../api.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../notification.service';


/**
 * Based on:
 * - https://openlayers.org/en/latest/examples/draw-and-modify-features.html; accessed: May 29, 2023; 11:37
 */

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  @Output() coordinateSelected = new EventEmitter<[number, number]>();

  map!: Map;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<any>;
  overlay!: Overlay;
  address: string = '';

  constructor(
    private coordinateService: CoordinateService,
    private apiService: ApiService,
    private translate: TranslateService,
    private notificationService: NotificationService
    ) {}

  ngOnInit() {
    this.initializeMap();
    this.initializeMarkerLayer();
  }

  ngAfterViewInit() {
    this.addClickListener();
  }

  /** Initializes the OpenLayers map with a tile layer and default view*/
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
        center: fromLonLat([13.404954, 52.520008]),
        zoom: 12
      })
    });
  }

  /**
   * Initializes the vector layer for displaying markers on the map
   * https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html 
   */
  initializeMarkerLayer() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({
            color: '#FF0000'
          })
        })
      })
    });
    this.map.addLayer(this.vectorLayer);
  }

  /**
   * Adds a click event listener to the map to handle marker placement
   * https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html
   * https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html
   * https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html#event:click
   */
  addClickListener() {
    this.map.on('click', (event) => {
      const coordinate = event.coordinate;

      this.vectorSource.clear();

      const marker = new Feature({
        geometry: new Point(coordinate),
      });
      this.vectorSource.addFeature(marker);

      this.displayPopup(coordinate as [number, number]);

      // Emit the selected coordinate to the parent component
      this.coordinateService.setCoordinate(coordinate as [number, number]);
      this.coordinateSelected.emit(coordinate as [number, number]);
    });
  }


  /**
   * Draws a marker on the map for the given longitude and latitude coordinates
   * @param long The longitude coordinate
   * @param lat The latitude coordinate
   */
  drawLongLatCoords(long: number, lat: number) {
    console.log("drawLongLatCoords")
    const coordinate = transform([long, lat], 'EPSG:4326', 'EPSG:3857');
    this.vectorSource.clear();
    const marker = new Feature({
      geometry: new Point(coordinate),
    });
    this.vectorSource.addFeature(marker);

    this.displayPopup(coordinate as [number, number]);

 // Displays a popup with the clicked coordinates
  }

  /**
   * Displays a popup with the clicked coordinates
   * @param coordinate The clicked coordinate
   */
  displayPopup(coordinate: [number, number]) {
    const popupElement = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    if (popupElement && popupContent) {

 /** https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html; accessed: May 29, 2023 at 14:39 */
      // Transform the coordinate to long/lat format
      const transformedCoords = this.coordinateService.transformToLongLat(coordinate);

      // Format the coordinate string
      const stringifyFunc = createStringXY(4);
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

  /**
   * Resets the map by clearing the marker layer and removing the popup overlay
   */
  resetMap() {
    this.vectorSource.clear();
    this.map.removeOverlay(this.overlay);
  }

  jumpToAddress() {
    if (this.address.trim() !== '') {
      this.apiService.geocodeAddress(this.address).subscribe((coordinates) => {
        if (coordinates) {
          const [longitude, latitude] = coordinates;
          const coordinate = transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
          this.map.getView().setCenter(coordinate);
          this.drawLongLatCoords(longitude, latitude);
        } else {
          const addresslookupfailed = this.translate.instant('map.lookupfail'); 
          this.notificationService.showInfo(addresslookupfailed)
        }
      });
    }
  }
}
