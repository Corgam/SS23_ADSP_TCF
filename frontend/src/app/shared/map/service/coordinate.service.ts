import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  private coordinateSubject = new Subject<[number, number]>();
  coordinate$ = this.coordinateSubject.asObservable();

  setCoordinate(coordinate: [number, number]) {
    this.coordinateSubject.next(coordinate);
  }
}