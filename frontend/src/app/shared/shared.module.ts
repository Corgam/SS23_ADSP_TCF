import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopMenuComponent } from './header/top-menu.component';
import { MaterialModule } from '../material.module';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CoordinateService } from './service/coordinate.service';
import { ApiService } from './service/api.service';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { AuthService } from './services/auth.service';
import { DataDisplayComponent } from './data-display/data-display.component';
import { DataDisplayDialogComponent } from './data-display/data-display-dialog/data-display-dialog.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { DialogService } from './service/dialog.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { DashboardTileComponent } from './dashboard-tile/dashboard-tile.component';

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
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})
export class SharedModule {}
