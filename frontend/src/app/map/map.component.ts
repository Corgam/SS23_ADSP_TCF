import { Component, EventEmitter, OnInit, Output, AfterViewInit, Input } from '@angular/core';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { Overlay, View, getUid } from 'ol';
import Point from 'ol/geom/Point';
import * as Geometry from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transform } from 'ol/proj';
import { Vector as source } from 'ol/source';
import XYZ from 'ol/source/XYZ';
import { Coordinate, createStringXY } from 'ol/coordinate';
import { Circle, Fill, Style } from 'ol/style';
import { CoordinateService } from '../shared/upload-map/service/coordinate.service';
import { ApiService } from '../api.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../notification.service';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { DataFileRadiusFilter, DataFileAreaFilter, FilterOperations } from '../../../../common/types/datafileFilter';
import { DataFileFilterSet } from '../../../../common/types/datafileFilterSet';
import { of } from 'rxjs';

export enum DrawObjectType {
  CIRCLE = "CIRCLE",
  POLYGON = "POLYGON"
}

interface DisplayFeatures {
  id: string,
  name: string,
  filter: DataFileRadiusFilter | DataFileAreaFilter
  feature: Feature,
}

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
  @Output() coordinateSelected = new EventEmitter<[number, number]>();


  map!: Map;
  source!: source;
  vector!: VectorLayer<any>;
  popupSource!: source;
  popupLayer!: VectorLayer<any>;
  overlay!: Overlay;
  address: string = '';

  draw!: Draw;
  snap!: Snap;
  modify!: Modify;

  polygonCounter = 1;
  circleCounter = 1;

  @Input()
  enableDrawFeatures = true;

  public DrawObjectType = DrawObjectType;
  drawType = DrawObjectType.POLYGON

  searchAreas: DisplayFeatures[] = [];

  constructor(
    private coordinateService: CoordinateService,
    private apiService: ApiService,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.initializeMap();
    this.addSubscription();
    this.addInteraction();

    if(!this.enableDrawFeatures){
      this.addClickListener();
    }

  }

  drawTypeChange() {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.addInteraction();
  }

  emptyAddress() {
    this.address = "";
    this.popupSource.clear();
    this.overlay.setPosition(undefined);
  }

  initializeMap() {
    this.source = new source({ wrapX: false });
    this.vector = new VectorLayer({
      source: this.source,
    });

    this.popupSource = new source({})
    this.popupLayer = new VectorLayer({
      source: this.popupSource,
      style: new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({
            color: '#FF0000'
          })
        })
      })
    });

    const raster = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    });

    this.map = new Map({
      target: 'map',
      layers: [raster, this.vector, this.popupLayer],
      view: new View({
        center: fromLonLat([13.404954, 52.520008]), // Berlin coordinates
        zoom: 12
      })
    });

    this.modify = new Modify({ source: this.source });
    this.map.addInteraction(this.modify);
    this.map.addInteraction(new Snap({ source: this.source }));
  }

  addInteraction() {

    switch (this.drawType) {
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

  addSubscription() {
    this.source.on('addfeature', (evt) => {
      var feature = evt.feature;
      console.log(feature)

      const filter = this.createFilterFromGeometry(feature);

      if (filter && feature?.getGeometry()?.getType() === "Polygon") {
        this.searchAreas.push({ id: getUid(feature?.getGeometry()), name: `Polygon ${this.polygonCounter++}`, filter, feature })
      } else if (filter && feature?.getGeometry()?.getType() === "Circle") {
        this.searchAreas.push({ id: getUid(feature?.getGeometry()), name: `Circle ${this.circleCounter++}`, filter, feature })
      }
      // console.log(this.searchAreas)
    });

    this.modify.on('modifyend', (evt) => {
      // var feature = evt.feature;
      console.log(evt.features.getArray()[0].getGeometry())

      const feature = evt.features.getArray()[0];
      const id = getUid(feature.getGeometry());
      const indexInSearchAreas = this.searchAreas.findIndex(area => area.id === id);
      const filter = this.createFilterFromGeometry(feature);
      if (indexInSearchAreas > -1 && filter) {
        this.searchAreas[indexInSearchAreas].filter = filter;
        this.searchAreas[indexInSearchAreas].feature = feature;
      }
      // console.log(this.searchAreas)
    });
  }


  createFilterFromGeometry(feature?: Feature<Geometry.Geometry>): DataFileAreaFilter | DataFileRadiusFilter | undefined {
    if (!feature) {
      return undefined;
    }

    if (feature?.getGeometry()?.getType() === "Polygon") {
      const polygon = feature?.getGeometry() as Geometry.Polygon;
      console.log(polygon.getCoordinates());

      return {
        key: "content.location",
        operation: FilterOperations.AREA,
        negate: false,
        value: {
          vertices: polygon.getCoordinates()[0].map(r => this.coordinateService.transformToLongLat(r) as number[])
        }
      }

    } else if (feature?.getGeometry()?.getType() === "Circle") {
      const circle = feature?.getGeometry() as Geometry.Circle;
      const center = this.coordinateService.transformToLongLat(circle.getCenter());
      const radius = circle.getRadius() / 1000;

      return {
        key: "content.location",
        operation: FilterOperations.RADIUS,
        negate: false,
        value: {
          center, radius
        }
      }
    }
    return undefined;
  }





    /**
     * Adds a click event listener to the map to handle marker placement
     * https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html
     * https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-source.html
     * https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html#event:click
     */
    addClickListener() {
      this.map.on('click', (event) => {

        // if(this.enableDrawFeatures){
        //   return;
        // }

        const coordinate = event.coordinate;

        this.popupSource.clear();

        const marker = new Feature({
          geometry: new Point(coordinate),
        });
        this.popupSource.addFeature(marker);

        this.displayPopup(coordinate as [number, number]);
        this.lookupAddressFromCoords(coordinate);

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
      this.popupSource.clear();
      const marker = new Feature({
        geometry: new Point(coordinate),
      });
      this.popupSource.addFeature(marker);

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

      console.log(popupElement && popupContent)

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
      this.source.clear();
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

    lookupAddressFromCoords(coords: Coordinate) {
      const coordinate = transform(coords, 'EPSG:3857','EPSG:4326');
        const coordinateString = `${coordinate[1]}, ${coordinate[0]}`;
        this.apiService.getAddress(coordinateString).subscribe((address) => {
          if (address) {
            this.address = address;
          } else {
            const mapLookupFail = this.translate.instant('map.lookupfail');
            this.notificationService.showInfo(mapLookupFail);
          }
        });
    }

    remove(id: string) {
      const entry = this.searchAreas.find(area => area.id === id);

      if(entry){
        this.source.removeFeature(entry.feature)
        this.searchAreas = this.searchAreas.filter(area => area.id !== id)
      }
    }

}
