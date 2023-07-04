import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterOutlet } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataDisplayComponent } from './data-display/data-display.component';
import { FilterBlockComponent } from './filter-blocks/filter-block/filter-block.component';
import { FilterBlocksComponent } from './filter-blocks/filter-blocks.component';
import { JourneyModule } from './journey/journey.module';
import { MapComponent } from './map/map.component';
import { MaterialModule } from './material.module';
import { SharedModule } from './shared/shared.module';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { ViewDatasetsComponent } from './view-datasets/view-datasets.component';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
    UploadDataComponent,
    ViewDatasetsComponent,
    MapComponent,
    DataDisplayComponent,
    FilterBlocksComponent,
    FilterBlockComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterOutlet,
    NgxJsonViewerModule,
    DashboardModule,
    JourneyModule,
    SharedModule,
    TranslateModule.forRoot({
      defaultLanguage: 'de',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],  
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
