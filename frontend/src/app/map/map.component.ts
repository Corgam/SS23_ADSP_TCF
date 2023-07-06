import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatChipListboxChange } from '@angular/material/chips';
import { TranslateService } from '@ngx-translate/core';
import { Overlay, View, getUid } from 'ol';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { Coordinate, createStringXY } from 'ol/coordinate';
import * as Geometry from 'ol/geom';
import Point from 'ol/geom/Point';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { Vector as VectorLayer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transform } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import XYZ from 'ol/source/XYZ';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { AreaFilter, FilterOperations, RadiusFilter } from '../../../../common/types';
import { ApiService } from '../api.service';
import { NotificationService } from '../notification.service';
import { CoordinateService } from './service/coordinate.service';
import { formatNumber } from '@angular/common';

export enum DrawObjectType {
  CIRCLE = "CIRCLE",
  POLYGON = "POLYGON"
}

interface DisplayFeatures {
  id: string,
  name: string,
  filter: RadiusFilter | AreaFilter
  feature: Feature,
  centerCoord?: Feature<Geometry.Point>,
}

/**
 * Based on:
 * - https://openlayers.org/en/latest/examples/draw-and-modify-features.html; accessed: May 29, 2023; 11:37
 */

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  @Output()
  coordinateSelected = new EventEmitter<[number, number]>();

  @Output()
  filterUpdated = new EventEmitter<(RadiusFilter | AreaFilter)[]>();

  @Input()
  enableDrawFeatures = true;

  @Input()
  // coordinatesToDisplay?: Coordinate[]  = [[13.290220890352364, 52.51062609466783], [13.321855215752981, 52.5126778726555], [13.35002734259763, 52.514555249302305]]
  coordinatesToDisplay?: Coordinate[]; //Data structure might

  map!: Map;

  source!: VectorSource;
  vector!: VectorLayer<any>;

  popupSource!: VectorSource;
  popupLayer!: VectorLayer<any>;
  overlay!: Overlay;

  pointSource!: VectorSource;
  pointLayer!: VectorLayer<any>;

  address: string = '';

  draw!: Draw;
  snap!: Snap;
  modify!: Modify;

  polygonCounter = 1;
  radiusCounter = 1;

  addressIsLoading = false;

  public DrawObjectType = DrawObjectType;
  drawType = DrawObjectType.CIRCLE

  searchAreas: DisplayFeatures[] = [];

  constructor(
    private coordinateService: CoordinateService,
    private apiService: ApiService,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.initializeMap();

    if (!this.enableDrawFeatures) {
      this.addClickListener();
    } else {
      this.addSubscription();
      this.addInteraction();
    }

    this.drawPoints();
  }

  initializeMap() {
    this.source = new VectorSource({ wrapX: false });
    this.vector = new VectorLayer({
      source: this.source,
    });

    this.popupSource = new VectorSource({})
    this.popupLayer = new VectorLayer({
      source: this.popupSource,
      style: new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: '#FF0000'
          })
        })
      })
    });

    this.pointSource = new VectorSource({})
    this.pointLayer = new VectorLayer({
      source: this.pointSource,
      style: new Style({
        image: new Circle({
          radius: 4.5,
          fill: new Fill({
            color: '#F54FA6'
          }),
          stroke: new Stroke({
            color: '#FFFFFF',
            width: 2
          })
        })
      })
    });

    const raster = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      }),
    });

    this.map = new Map({
      target: 'map',
      layers: [raster, this.vector, this.popupLayer, this.pointLayer],
      view: new View({
        center: fromLonLat([13.404954, 52.520008]), // Berlin coordinates
        zoom: 12,
      })
    });

    this.modify = new Modify({ source: this.source });
    this.map.addInteraction(this.modify);
    this.map.addInteraction(new Snap({ source: this.source }));
  }

  drawPoints(){
    (this.coordinatesToDisplay ?? []).forEach(coords => {
      const point = new Feature({
        geometry: new Point(fromLonLat(coords)),
      });
      this.pointSource.addFeature(point);
    })
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

      const filter = this.createFilterFromGeometry(feature);

      if (filter && feature?.getGeometry()?.getType() === "Polygon") {
        this.searchAreas.push({ id: getUid(feature?.getGeometry()), name: `Polygon ${this.polygonCounter++}`, filter, feature })
      } else if (filter && feature?.getGeometry()?.getType() === "Circle") {
        const radius = (feature?.getGeometry() as Geometry.Circle).getRadius();
        const center = (feature?.getGeometry() as Geometry.Circle).getCenter();

        const marker = new Feature({
          geometry: new Point(center),
        });
        marker.setStyle(new Style({
          image: new Circle({
            radius: 3,
            fill: new Fill({
              color: '#141414'
            })
          })
        }))
        this.pointSource.addFeature(marker);


        this.searchAreas.push({ id: getUid(feature?.getGeometry()), name: `Radius ${this.radiusCounter++} (${this.formatRadius(radius)})`, filter, feature, centerCoord: marker })
      }
      this.emitChanges();
      this.emptyAddress();
    });

    this.modify.on('modifyend', (evt) => {
      const feature = evt.features.getArray()[0];
      const id = getUid(feature.getGeometry());
      const indexInSearchAreas = this.searchAreas.findIndex(area => area.id === id);
      const filter = this.createFilterFromGeometry(feature);
      if (indexInSearchAreas > -1 && filter) {
        this.searchAreas[indexInSearchAreas].filter = filter;
        this.searchAreas[indexInSearchAreas].feature = feature;

        const name = this.searchAreas[indexInSearchAreas].name;
        if(name.includes("Radius")){
          const index = name.indexOf("(");
          const radius = (feature?.getGeometry() as Geometry.Circle).getRadius();
          this.searchAreas[indexInSearchAreas].name = `${name.substring(0,index)} (${this.formatRadius(radius)})`
        }
      }
      this.emitChanges();
      this.emptyAddress();
    });

    this.source.on('changefeature', (evt) => {
      const feature = evt.feature;
      if(!feature || feature?.getGeometry()?.getType() !== "Circle"){
        return;
      }
      const id = getUid(feature.getGeometry());
      const indexInSearchAreas = this.searchAreas.findIndex(area => area.id === id);
      const center = (feature?.getGeometry() as Geometry.Circle).getCenter();

      if (indexInSearchAreas > -1) {
        this.searchAreas[indexInSearchAreas].centerCoord!.getGeometry()?.setCoordinates(center)
      }
    });
  }

  private emitChanges(){
    this.filterUpdated.emit(this.searchAreas.map(area => area.filter));
  }

  private formatRadius(radius: number){
    if(radius < 1000){
      return `${formatNumber(radius, 'en', '1.0-0')}m`;
    } else {
      return `${formatNumber(radius / 1000, 'en', '1.1-3')}km`;
    }
  }

  createFilterFromGeometry(feature?: Feature<Geometry.Geometry>): AreaFilter | RadiusFilter | undefined {
    if (!feature) {
      return undefined;
    }

    if (feature?.getGeometry()?.getType() === "Polygon") {
      const polygon = feature?.getGeometry() as Geometry.Polygon;

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
    const coordinate = transform([long, lat], 'EPSG:4326', 'EPSG:3857');
    this.popupSource.clear();
    const marker = new Feature({
      geometry: new Point(coordinate),
    });
    this.popupSource.addFeature(marker);

    if(!this.enableDrawFeatures) {
      // Displays a popup with the clicked coordinates
      this.displayPopup(coordinate as [number, number]);
    }
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
      const transformedCoords =
        this.coordinateService.transformToLongLat(coordinate);

      // Format the coordinate string
      const stringifyFunc = createStringXY(4);
      const out = stringifyFunc(transformedCoords);
      popupContent.innerHTML = `${this.translate.instant('map.coordinate')}: ${out}`;

      this.overlay = new Overlay({
        element: popupElement,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10],
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
      this.addressIsLoading = true;
      this.apiService.geocodeAddress(this.address).subscribe((coordinates) => {
        if (coordinates) {
          const [longitude, latitude] = coordinates;
          const coordinate = transform(
            [longitude, latitude],
            'EPSG:4326',
            'EPSG:3857'
          );
          this.map.getView().setCenter(coordinate);
          this.drawLongLatCoords(longitude, latitude);
        } else {
          const addresslookupfailed = this.translate.instant('map.lookupfail');
          this.notificationService.showInfo(addresslookupfailed)
        }
        this.addressIsLoading = false;
      });
    }
  }

  lookupAddressFromCoords(coords: Coordinate) {
    this.addressIsLoading = true;
    const coordinate = transform(coords, 'EPSG:3857', 'EPSG:4326');
    const coordinateString = `${coordinate[1]}, ${coordinate[0]}`;
    this.apiService.getAddress(coordinateString).subscribe((address) => {
      if (address) {
        this.address = address;
      } else {
        const mapLookupFail = this.translate.instant('map.lookupfail');
        this.notificationService.showInfo(mapLookupFail);
      }
      this.addressIsLoading = false;
    });
  }

  removeChip(id: string) {
    const entry = this.searchAreas.find(area => area.id === id);

    if (entry) {
      this.source.removeFeature(entry.feature);
      if(entry.centerCoord){
        this.pointSource.removeFeature(entry.centerCoord);
      }
      this.searchAreas = this.searchAreas.filter(area => area.id !== id)
    }
  }

  chipSelectionChanged(change: MatChipListboxChange) {
    this.searchAreas.forEach(area => {
      if (area.name === change.value) {
        area.feature.setStyle(new Style({
          stroke: new Stroke({
            color: 'rgb(103, 58, 183)',
            width: 3,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.5)'
          })
        }))
      } else {
        area.feature.setStyle(undefined)
      }
    })
  }

  drawTypeChange() {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.addInteraction();
  }

  emptyAddress() {
    this.address = "";
    this.popupSource.clear();
    if (this.overlay) {
      this.overlay.setPosition(undefined);
    }
  }
}
