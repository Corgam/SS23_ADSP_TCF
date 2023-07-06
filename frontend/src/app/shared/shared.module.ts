import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopMenuComponent } from './header/top-menu.component';
import { MaterialModule } from '../material.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataDisplayComponent } from './data-display/data-display.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import {YouTubePlayerModule} from '@angular/youtube-player';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [TopMenuComponent, DataDisplayComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    NgxJsonViewerModule,
    YouTubePlayerModule,
    TranslateModule.forChild(),
  ],
  exports: [TopMenuComponent, DataDisplayComponent],
  providers: [],
})
export class SharedModule {}
