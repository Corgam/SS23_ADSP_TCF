import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/** Basecomponent of the application */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private translate: TranslateService) { }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}