import { formatNumber } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  AfterViewInit,
  Output,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
import {
  AreaFilter,
  FilterOperations,
  RadiusFilter,
} from '../../../../common/types';
import { NotificationService } from '../notification.service';
import { ApiService } from '../shared/service/api.service';
import { CoordinateService } from '../shared/service/coordinate.service';
import {
  isAreaFilter,
  isMapFilter,
  isRadiusFilter,
} from '../../util/filter-utils';

/** Enum of the shape, which is currently drawn */
export enum DrawObjectType {
  CIRCLE = 'CIRCLE',
  POLYGON = 'POLYGON',
}

/** Defines one applied filter */
interface DisplayFeatures {
  id: string; //the unique id of the drawn feature
  name: string; //the name displayed in the chips
  filter: RadiusFilter | AreaFilter; //the filter for the backend
  feature: Feature; //the feature with its geometry
  centerCoord?: Feature<Geometry.Point>; //for radius, the center coordinate
}

/** Defines for a list of coordinates the same color  */
export interface DisplayCollection {
  coordinates: Coordinate[];
  hexColor: string; //HEX-Code with '#', e.g., "#FFFFFF"
}

/**
 * Based on:
 * - https://openlayers.org/en/latest/examples/draw-and-modify-features.html; accessed: May 29, 2023; 11:37
 * 
 * This Map serves two purposes. For one, it allows the user to look up an address and set a location on the map 
 * for the upload of data. Secondly, this map allows for managing the area-filters in the journey page.
 * 
 * Caution: The map uses internally the EPSG:3857 projection.
 */

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnChanges {
  
  /** 
   * Emits the coordinates of the location clicked in the map.
   * Requires enableDrawFeatures to be turned off.
   */
  @Output()
  coordinateSelected = new EventEmitter<[number, number]>();

  /** 
   * Emits as soon as the the currently applied filter changed and contains all filters.
   * Requires enableDrawFeatures to be turned on.
   */
  @Output()
  filterUpdated = new EventEmitter<(RadiusFilter | AreaFilter)[]>();

  /** Reference to the map in the HTML file */
  @ViewChild('map')
  mapContainer?: ElementRef<HTMLDivElement>;

  /**
   * If true, the map includes the features required for the journey page.
   * If false, the map includes the features required for uploading the data.
   */
  @Input()
  enableDrawFeatures = true;

  /** Optional input of already existing filters */
  @Input()
  presetFilters?: (RadiusFilter | AreaFilter)[];

  /** If true, the map will reset its filters to match the preset filters */
  @Input()
  matchPresetFilters = true;

  /** The collections to display. Each list element contains the respective coordinates and color information */
  @Input()
  collections?: DisplayCollection[];

  map!: Map;

  /* VectorSource and Layer for drawing shapes*/
  source!: VectorSource;
  vector!: VectorLayer<any>;

  /* VectorSource and Layer for displaying the clicked coordinate and its popup */
  popupSource!: VectorSource;
  popupLayer!: VectorLayer<any>;
  overlay!: Overlay;

  /* VectorSource and Layer for displaying the points of the collections */
  pointSource!: VectorSource;
  pointLayer!: VectorLayer<any>;

  /** Search string for the address */
  address: string = '';

  /** Draw-functionalities for the map. Allows the drawing of shapes */
  draw!: Draw;

  /** Snap-functionalities for the map. Allows the cursor to snap to points */
  snap!: Snap;

  /** Modify-functionalities for the map. Allows the modification of drawn features */
  modify!: Modify;

  /** Needed for naming the different polygon filters */
  polygonCounter = 1;

  /** Needed for naming the different radius filters */
  radiusCounter = 1;

  addressIsLoading = false;

  public DrawObjectType = DrawObjectType; //makes the enum available in the HTML
  drawType = DrawObjectType.CIRCLE;

  searchAreas: DisplayFeatures[] = [];
  initializingFilters = true;

  constructor(
    private coordinateService: CoordinateService,
    private apiService: ApiService,
    private translate: TranslateService,
    private notificationService: NotificationService
  ) {}

  ngAfterViewInit() {
    this.initializeMap();

    if (!this.enableDrawFeatures) {
      this.addClickListener();
    } else {
      this.addSubscription();
      this.addInteraction();
    }

    if (this.presetFilters != null) {
      this.createFeaturesFromPresetFilters(this.presetFilters);
    }

    this.initializingFilters = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collections'] || (changes['presetFilters'] && this.source)) {
      if (this.presetFilters != null) {
        this.createFeaturesFromPresetFilters(this.presetFilters || []);
      }
      this.drawPoints();
    }
  }

  /**
   * Create the features, i.e., geometries on the map, based on the passed filters.
   * @param filters passed filters
   */
  createFeaturesFromPresetFilters(filters: (RadiusFilter | AreaFilter)[]) {
    if (this.matchPresetFilters) {
      //reset counter
      this.radiusCounter = 1;
      this.polygonCounter = 1;
      this.searchAreas = [];
      this.source.clear();
    }

    filters.forEach((filter) => {
      if ( !isMapFilter(filter) || this.searchAreas.find((area) => area.filter == filter) != null
      ) {
        //filter not applicable
        return;
      }

      //create corresponding feature
      let feature = isRadiusFilter(filter)
        ? new Feature({
            geometry: new Geometry.Circle(
              fromLonLat(filter.value.center),
              filter.value.radius * 1000 * 2
            ),
          })
        : new Feature({
            geometry: new Geometry.Polygon([
              filter.value.vertices.map((coords) => fromLonLat(coords)),
            ]),
          });

      //Create entry in chip list
      this.searchAreas.push({
        id: getUid(feature.getGeometry()),
        name: isRadiusFilter(filter)
          ? `Radius ${this.radiusCounter++} (${this.formatRadius(
              filter.value.radius * 1000
            )})`
          : `Polygon ${this.polygonCounter++}`,
        filter,
        feature,
        centerCoord: isRadiusFilter(filter)
          ? this.drawRadiusCenter(fromLonLat(filter.value.center))
          : undefined,
      });
      this.source.addFeature(feature);
    });
  }

  /** Initializes the Map with its layers and styles. */
  initializeMap() {
    this.source = new VectorSource({ wrapX: false });
    this.vector = new VectorLayer({
      source: this.source,
    });

    this.popupSource = new VectorSource({});
    this.popupLayer = new VectorLayer({
      source: this.popupSource,
      style: new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({
            color: '#FF0000',
          }),
        }),
      }),
    });

    this.pointSource = new VectorSource({});
    this.pointLayer = new VectorLayer({
      source: this.pointSource,
    });

    const raster = new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      }),
    });

    this.map = new Map({
      target: this.mapContainer?.nativeElement,
      layers: [raster, this.vector, this.popupLayer, this.pointLayer],
      view: new View({
        center: fromLonLat([13.404954, 52.520008]), // Berlin coordinates
        zoom: 12,
      }),
    });

    this.modify = new Modify({ source: this.source });
    this.map.addInteraction(this.modify);
    this.map.addInteraction(new Snap({ source: this.source }));
  }

  /** Draws the coordinates of each collection */
  drawPoints() {
    this.pointSource?.clear();
    (this.collections ?? []).forEach((collection) => {
      const point = new Feature({
        geometry: new Geometry.MultiPoint(
          collection.coordinates.map((coords) => fromLonLat(coords))
        ),
      });

      //Changes the color of the points based on the based color value
      point.setStyle(
        new Style({
          image: new Circle({
            radius: 4.75,
            fill: new Fill({
              color: collection.hexColor,
            }),
            stroke: new Stroke({
              color: '#000000',
              width: 1,
            }),
          }),
        })
      );
      this.pointSource.addFeature(point);
    });

    (this.searchAreas ?? []).forEach((area) => {
      if (area.centerCoord != null)
        //The center point of each radius is a separate feature
        this.pointSource.addFeature(area.centerCoord);
    });
  }

  /**
   * Draws the coordinate on the map as a center point
   * @param center coordinates of the center of the search radius
   * @returns the created point
   */
  drawRadiusCenter(center: Coordinate) {
    const marker = new Feature({
      geometry: new Point(center),
    });
    marker.setStyle(
      new Style({
        image: new Circle({
          radius: 3,
          fill: new Fill({
            color: '#141414',
          }),
        }),
      })
    );
    this.pointSource.addFeature(marker);
    return marker;
  }

  /** Depending on the drawType, the interaction to draw shapes is added */
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

  /**
   * Adds subscriptions when features are created and modified.
   */
  addSubscription() {
    //a new feature was drawn
    this.source.on('addfeature', (evt) => {
      var feature = evt.feature;
      if ( this.searchAreas.find((area) => area.id == getUid(feature?.getGeometry())) != null ){
        //the feature is not new/ the UIDs match -> this should not happen
        return;
      }

      const filter = this.createFilterFromGeometry(feature);

      if (filter && feature?.getGeometry()?.getType() === 'Polygon') {
        //adds the filter to the chips and sets the name of the filter.
        this.searchAreas.push({
          id: getUid(feature?.getGeometry()),
          name: `Polygon ${this.polygonCounter++}`,
          filter,
          feature,
        });
      } else if (filter && feature?.getGeometry()?.getType() === 'Circle') {
        const radius = (feature?.getGeometry() as Geometry.Circle).getRadius() / 2; //actually, it returns the diameter
        const center = (feature?.getGeometry() as Geometry.Circle).getCenter();

        const marker = this.drawRadiusCenter(center);

        this.searchAreas.push({
          id: getUid(feature?.getGeometry()),
          name: `Radius ${this.radiusCounter++} (${this.formatRadius(radius)})`,
          filter,
          feature,
          centerCoord: marker,
        });
      }
      this.emitChanges();
      this.emptyAddress();
    });

    //an existing feature was just modified
    this.modify.on('modifyend', (evt) => {
      const feature = evt.features.getArray()[0];
      const id = getUid(feature.getGeometry());
      const indexInSearchAreas = this.searchAreas.findIndex((area) => area.id === id );
      if (
        indexInSearchAreas > -1 &&
        this.modifyFilterFromGeometry(
          this.searchAreas[indexInSearchAreas].filter,
          feature
        )
      ) {
        //Feature exists -> override existing with new feature
        this.searchAreas[indexInSearchAreas].feature = feature;

        const name = this.searchAreas[indexInSearchAreas].name;
        if (name.includes('Radius')) {
          const index = name.indexOf('(');
          const radius = (feature?.getGeometry() as Geometry.Circle).getRadius() / 2;

          //update name and length of radius
          this.searchAreas[indexInSearchAreas].name = `${name.substring(0,index)} (${this.formatRadius(radius)})`;
        }
      }
      this.emitChanges();
      this.emptyAddress();
    });

    //a feature was moved
    this.source.on('changefeature', (evt) => {
      const feature = evt.feature;
      if (!feature || feature?.getGeometry()?.getType() !== 'Circle') {
        //No further action required for non-circles
        return;
      }
      const id = getUid(feature.getGeometry());
      const indexInSearchAreas = this.searchAreas.findIndex((area) => area.id === id);
      const center = (feature?.getGeometry() as Geometry.Circle).getCenter();

      if (indexInSearchAreas > -1) {
        //Since the center point it not part of the original feature, it has to be moved separately
        this.searchAreas[indexInSearchAreas].centerCoord!.getGeometry()?.setCoordinates(center);
      }
    });
  }

  private emitChanges() {
    if (!this.initializingFilters) {
      this.filterUpdated.emit(this.searchAreas.map((area) => area.filter));
    }
  }

  private formatRadius(radius: number) {
    if (radius < 1000) {
      return `${formatNumber(radius, 'en', '1.0-0')}m`;
    } else {
      return `${formatNumber(radius / 1000, 'en', '1.1-3')}km`;
    }
  }

  /**
   * Creates based on a geometry a filter for the backend
   * @param feature any geometry
   * @returns the appropriate filter or undefined
   */
  createFilterFromGeometry(feature?: Feature<Geometry.Geometry>): AreaFilter | RadiusFilter | undefined {
    if (!feature) {
      return undefined;
    }

    if (feature?.getGeometry()?.getType() === 'Polygon') {
      const polygon = feature.getGeometry() as Geometry.Polygon;

      return {
        key: 'content.location',
        operation: FilterOperations.AREA,
        negate: false,
        value: {
          vertices: polygon
            .getCoordinates()[0]
            .map(
              (r) => this.coordinateService.transformToLongLat(r) as number[]
            ),
        },
      };
    } else if (feature?.getGeometry()?.getType() === 'Circle') {
      const circle = feature.getGeometry() as Geometry.Circle;
      const center = this.coordinateService.transformToLongLat(
        circle.getCenter()
      );
      const radius = circle.getRadius() / 2 / 1000;

      return {
        key: 'content.location',
        operation: FilterOperations.RADIUS,
        negate: false,
        value: {
          center,
          radius,
        },
      };
    }
    //no other shapes are currently supported
    return undefined;
  }

  /**
   * Modifies an existing filter
   * @param filter existing filter
   * @param feature changed feature
   * @returns changed filter, else false
   */
  modifyFilterFromGeometry(
    filter: RadiusFilter | AreaFilter,
    feature?: Feature<Geometry.Geometry>
  ): AreaFilter | RadiusFilter | false {
    if (!feature) {
      return false;
    }

    if (
      feature?.getGeometry()?.getType() === 'Polygon' &&
      isAreaFilter(filter)
    ) {
      const polygon = feature.getGeometry() as Geometry.Polygon;

      filter.value.vertices = polygon
        .getCoordinates()[0]
        .map((r) => this.coordinateService.transformToLongLat(r) as number[]);
      return filter;
    } else if (
      feature?.getGeometry()?.getType() === 'Circle' &&
      isRadiusFilter(filter)
    ) {
      const circle = feature.getGeometry() as Geometry.Circle;
      const center = this.coordinateService.transformToLongLat(
        circle.getCenter()
      );
      const radius = circle.getRadius() / 2 / 1000;

      filter.value.center = center;
      filter.value.radius = radius;
      return filter;
    }
    return false;
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

    if (!this.enableDrawFeatures) {
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
      popupContent.innerHTML = `${this.translate.instant(
        'map.coordinate'
      )}: ${out}`;

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
    this.popupSource.clear();
  }

  /** Makes a call to lookup the API */
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
          this.map.getView().setCenter(coordinate); //re-centers the map
          this.drawLongLatCoords(longitude, latitude);
        } else {
          const addresslookupfailed = this.translate.instant('map.lookupfail');
          this.notificationService.showInfo(addresslookupfailed);
        }
        this.addressIsLoading = false;
      });
    }
  }

  /**
   * Based on the passed coordinates. the nearest address will be looked up and set
   * @param coords the coords to search for
   */
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

  /**
   * Removes a chip and the assigned filter
   * @param id id of the entry
   */
  removeChip(id: string) {
    const entry = this.searchAreas.find((area) => area.id === id);

    if (entry) {
      //deletes the filter
      this.source.removeFeature(entry.feature);
      if (entry.centerCoord) {
        //deletes also the center point if present
        this.pointSource.removeFeature(entry.centerCoord);
      }
      this.searchAreas = this.searchAreas.filter((area) => area.id !== id);
      this.emitChanges();
    }
  }

  /**
   * Highlights the feature of the clicked chip
   * @param change 
   */
  chipSelectionChanged(change: MatChipListboxChange) {
    this.searchAreas.forEach((area) => {
      if (area.name === change.value) {
        area.feature.setStyle(
          new Style({
            stroke: new Stroke({
              color: 'rgb(103, 58, 183)',
              width: 3,
            }),
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.5)',
            }),
          })
        );
      } else {
        //use the predefined style
        area.feature.setStyle(undefined);
      }
    });
  }

  /** Update the draw functionality */
  drawTypeChange() {
    this.map.removeInteraction(this.draw);
    this.map.removeInteraction(this.snap);
    this.addInteraction();
  }

  /** Empties the address lookup field */
  emptyAddress() {
    this.address = '';
    this.popupSource.clear();
    if (this.overlay) {
      //removes the overlay
      this.overlay.setPosition(undefined);
    }
  }
}
