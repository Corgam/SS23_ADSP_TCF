import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MaterialModule } from '../material.module';
import { DataDisplayComponent } from './data-display/data-display.component';
import { TopMenuComponent } from './header/top-menu.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { ApiService } from './service/api.service';
import { CoordinateService } from './service/coordinate.service';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [TopMenuComponent, DataDisplayComponent, InputDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    NgxJsonViewerModule,
    YouTubePlayerModule,
    TranslateModule.forChild()
  ],
  exports: [
    TopMenuComponent,
    DataDisplayComponent
  ],
  providers: [
    CoordinateService,
    ApiService
  ],
})
export class SharedModule {}
