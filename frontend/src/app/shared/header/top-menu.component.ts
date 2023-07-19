import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';
import { CoordinateService } from '../service/coordinate.service';

@Component({
  selector: 'top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.scss'],
})
export class TopMenuComponent implements OnInit {
  @Output() languageChanged = new EventEmitter<string>();

  coordinate: [number, number] | undefined;
  loggedInUser: string = '';
  supportedLanguages = ['de', 'en'];
  currentLanguage: string;
  showHomeButton: boolean = false;
  isFirstLoad: boolean = true;

  user$: Observable<User | null>;

  constructor(
    private coordinateService: CoordinateService,
    private translate: TranslateService,
    private router: Router,
    private auth: AuthService
  ) {
    this.translate.setDefaultLang('de');
    this.user$ = auth.user$;
    this.currentLanguage = localStorage.getItem('language') || 'de';
    this.translate.use(this.currentLanguage);
  }

  ngOnInit() {
    this.coordinateService.coordinate$.subscribe((coordinate) => {
      this.coordinate = coordinate;
    });
    
    this.translate.onLangChange.subscribe(() => {
      this.initializeHeader();
    });

    this.initializeHeader();

    // check router status
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showHomeButton = event.url !== '/' && event.url !== '/dashboard';
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
    this.auth.logout();
  }

  goToStartPage() {
    this.router.navigate(['/']);
  }
}
