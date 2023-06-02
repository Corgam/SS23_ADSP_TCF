import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CoordinateService } from '../map/service/coordinate.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';

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
  showBackButton: boolean = false;
  isFirstLoad: boolean = true;

  constructor(
    private coordinateService: CoordinateService,
    private translate: TranslateService,
    private router: Router
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

    this.translate.onLangChange.subscribe(() => {
      this.initializeHeader();
    });

    this.initializeHeader();

    // check router status
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showBackButton = event.url !== '/dashboard'; 
        this.isFirstLoad = false;
      }
    });
  }

  initializeHeader() {
    // Führe die initialen Einstellungen für den Header durch
    this.loggedInUser = 'Max Mustermann';
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    this.languageChanged.emit(language);
  }

  logout() {
    // Implement logout 
  }

  goToStartPage() {
    this.router.navigate(['/']);
  }
}
