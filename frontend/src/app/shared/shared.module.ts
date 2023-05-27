import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopMenuComponent } from './header/top-menu.component';
import { MaterialModule } from '../material.module';
import { MapComponent } from './map/map.component';
import { CoordinateService } from './map/service/coordinate.service';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    TopMenuComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule.forChild()
  ],
  exports: [
    TopMenuComponent,
    MapComponent
  ],
  providers: [
    CoordinateService
  ],
})
export class SharedModule { }
