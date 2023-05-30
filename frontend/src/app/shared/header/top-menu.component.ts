import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { CoordinateService } from "../map/service/coordinate.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.scss']
})
export class TopMenuComponent implements OnInit {

  @Output() languageChanged = new EventEmitter<string>();

  coordinate: [number, number] | undefined;
  loggedInUser: string = '';
  supportedLanguages = ['de', 'en'];
  currentLanguage: string;

  constructor(
    private coordinateService: CoordinateService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('de');
    this.loggedInUser = 'Max Mustermann';
    this.currentLanguage = localStorage.getItem('language') || 'de';
    this.translate.use(this.currentLanguage);
  }

  ngOnInit() {
    this.coordinateService.coordinate$.subscribe((coordinate) => {
      this.coordinate = coordinate;
      // do something with the coordinate
    });
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.languageChanged.emit(language);
  }
}