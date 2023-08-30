import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { MaterialModule } from '../material.module';
import { DashboardTileComponent } from './dashboard-tile/dashboard-tile.component';
import { DataDisplayDialogComponent } from './data-display/data-display-dialog/data-display-dialog.component';
import { DataDisplayComponent } from './data-display/data-display.component';
import { TopMenuComponent } from './header/top-menu.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ApiService } from './service/api.service';
import { CoordinateService } from './service/coordinate.service';
import { DialogService } from './service/dialog.service';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [TopMenuComponent, InputDialogComponent, DataDisplayComponent, DataDisplayDialogComponent, DashboardTileComponent],
  imports: [
    CommonModule,
    FormsModule,
    YouTubePlayerModule,
    MaterialModule,
    TranslateModule.forChild(),
    NgxJsonViewerModule
  ],
  exports: [
    TopMenuComponent,
    DataDisplayComponent,
    DataDisplayDialogComponent,
    DashboardTileComponent
  ],
  providers: [
    CoordinateService,
    ApiService,
    DialogService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})
export class SharedModule {}
