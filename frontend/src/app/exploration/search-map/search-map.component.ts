import { Component, OnInit } from '@angular/core';
import { View } from 'ol';
// import TileLayer from 'ol/layer/Tile';
import { OSM, XYZ } from 'ol/source';
import Map from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector';
import { createBox } from 'ol/interaction/Draw';
import { Circle } from 'ol/geom';

export enum DrawObjectType {
  BOX = "BOX",
  CIRCLE = "CIRCLE",
  POLYGON = "POLYGON"

}

/**
 * Based on the Openlayers examples:
 * - https://openlayers.org/en/latest/examples/draw-shapes.html; accessed: 03.06.2023, 14:03
 * https://openlayers.org/en/latest/apidoc/module-ol_geom_Circle-Circle.html
 */

@Component({
  selector: 'app-search-map',
  templateUrl: './search-map.component.html',
  styleUrls: ['./search-map.component.scss']
})
export class SearchMapComponent implements OnInit {

  map!: Map;
  source!: VectorSource;
  vector!: VectorLayer<any>;

  draw!: Draw;
  snap!: Snap;

  drawType!: DrawObjectType;
  ngOnInit() {
    this.drawType = DrawObjectType.BOX
    this.initializeMap();
    this.addSubscription();
    this.addInteraction()

  }

  mediaTypeOptions = [
    {value: DrawObjectType.CIRCLE, viewValue: 'Circle'},
    {value: DrawObjectType.BOX, viewValue: 'Box'},
    {value: DrawObjectType.POLYGON, viewValue: 'Polygon'},
  ];

  initializeMap() {
    this.source = new VectorSource({ wrapX: false });
    this.vector = new VectorLayer({
      source: this.source,
    });

    const raster = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    });

    this.map = new Map({
      target: 'map',
      layers: [raster, this.vector],
      view: new View({
        center: fromLonLat([13.404954, 52.520008]), // Berlin coordinates
        zoom: 12
      })
    });


    this.map.addInteraction(new Modify({ source: this.source }));
    this.map.addInteraction(new Snap({ source: this.source }));
  }

  addInteraction() {

    switch (this.drawType) {
      case DrawObjectType.BOX:
        this.draw = new Draw({
          source: this.source,
          type: 'Circle',
          geometryFunction: createBox(),
        });
        break;
      case DrawObjectType.CIRCLE:
        this.draw = new Draw({
          source: this.source,
          type: 'Circle',
        });
        break;
      case DrawObjectType.POLYGON:
        this.draw = new Draw({
          source: this.source,
          type: 'Polygon',
        });
        break;
      default:
        break;
    }

    this.map.addInteraction(this.draw);
  }

  addSubscription(){
    //changeFeature
    this.source.on('addfeature', function(evt){
      var feature = evt.feature;
      console.log(feature)
      // const circle = feature?.getGeometry() as Circle;
      // console.log(circle.getCenter())
      // console.log(circle.getRadius())
  });
  
  }

}