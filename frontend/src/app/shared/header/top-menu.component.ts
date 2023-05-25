import { Component, OnDestroy, OnInit, Input } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { CoordinateService } from "../map/service/coordinate.service";

@Component({
	selector: 'top-menu',
	templateUrl: './top-menu.component.html',
	styleUrls: ['./top-menu.scss']
})
export class TopMenuComponent {
  coordinate: [number, number] | undefined;
  loggedInUser: string = '';

  constructor(
    private coordinateService: CoordinateService
  ) {

    this.loggedInUser = 'Max Mustermann';
  }

  ngOnInit() {
    this.coordinateService.coordinate$.subscribe((coordinate) => {
      this.coordinate = coordinate;
      // do something with the coordinate
    });
  }
}

