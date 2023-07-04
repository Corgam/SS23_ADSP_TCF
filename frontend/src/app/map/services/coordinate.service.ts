import { Injectable } from '@angular/core';
import { Coordinate } from 'ol/coordinate';
import { transform } from 'ol/proj';
import { Subject } from 'rxjs';

@Injectable()
export class CoordinateService {
  private coordinateSubject = new Subject<[number, number]>();
  coordinate$ = this.coordinateSubject.asObservable();

  setCoordinate(coordinate: [number, number]) {
    this.coordinateSubject.next(coordinate);
  }

  transformToLongLat(coordinate: Coordinate) {
    return transform(coordinate, 'EPSG:3857', 'EPSG:4326');
  }
}
