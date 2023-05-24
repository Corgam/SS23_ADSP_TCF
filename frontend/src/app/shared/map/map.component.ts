import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import Overlay from 'ol/Overlay';
import { click } from 'ol/events/condition';
import { Style, Icon } from 'ol/style';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map!: Map;
  vectorSource!: VectorSource;
  vectorLayer!: VectorLayer<any>;
  overlay!: Overlay;

  ngOnInit() {
    this.initializeMap();
    this.initializeMarkerLayer();
    this.addClickListener();
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

    this.map.getView().on('change:resolution', () => {
      this.updateMarkerScale();
    });
  }

  initializeMarkerLayer() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });
    this.map.addLayer(this.vectorLayer);
  }

  addClickListener() {
    this.map.on('click', (event) => {
      const coordinate = event.coordinate;

      const marker = new Feature({
        geometry: new Point(coordinate),
      });

      const iconStyle = new Style({
        image: new Icon({
          src: 'assets/images/marker.png',
          anchor: [0.5, 1],
          scale: 0.5
        })
      });

      marker.setStyle(iconStyle);
      this.vectorSource.addFeature(marker);

      this.displayPopup(coordinate as [number, number]);
      this.updateMarkerScale();
    });
  }

  displayPopup(coordinate: [number, number]) {
    const popupElement = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    if (popupElement && popupContent) {
      popupContent.innerHTML = `Coordinates: ${coordinate}`;

      this.overlay = new Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -15]
      });

      this.map.addOverlay(this.overlay);
      this.overlay.setPosition(coordinate);
    }
  }

  updateMarkerScale() {
    const zoom = this.map.getView().getZoom() || 1;
    const scale = Math.max(0.2, 1 / zoom); // Adjust the scale factor based on your preference

    this.vectorSource.getFeatures().forEach((feature) => {
      const iconStyle = feature.getStyle();
      if (iconStyle instanceof Style) {
        const icon = iconStyle.getImage();
        if (icon instanceof Icon) {
          icon.setScale(scale);
        }
      }
    });
  }
}
