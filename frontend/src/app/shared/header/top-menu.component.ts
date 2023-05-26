import { Component, OnDestroy, OnInit, Input } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { CoordinateService } from "../map/service/coordinate.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: 'top-menu',
	templateUrl: './top-menu.component.html',
	styleUrls: ['./top-menu.scss']
})
export class TopMenuComponent {
  coordinate: [number, number] | undefined;
  loggedInUser: string = '';

  constructor(
    private coordinateService: CoordinateService,
    private translate: TranslateService) {
      // Setzt die Standardsprache auf Deutsch
      translate.setDefaultLang('en');
      // Bestimmt die aktive Sprache anhand des Browsers
      translate.use(translate.getBrowserLang() || 'en');
    this.loggedInUser = 'Max Mustermann';
  }

  ngOnInit() {
    this.coordinateService.coordinate$.subscribe((coordinate) => {
      this.coordinate = coordinate;
      // do something with the coordinate
    });
  }
}

