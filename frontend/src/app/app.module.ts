import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MaterialModule } from './material.module';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { SharedModule } from './shared/shared.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ViewDatasetsComponent } from './view-datasets/view-datasets.component';
import { MapComponent } from './map/map.component';
import { FilterBlocksComponent } from './filter-blocks/filter-blocks.component';
import { FilterBlockComponent } from './filter-blocks/filter-block/filter-block.component';
import { UploadDataModule } from './upload-data/upload-data.module';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
    ViewDatasetsComponent,
    MapComponent,
    FilterBlocksComponent,
    FilterBlockComponent
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
    DashboardModule,
    UploadDataModule,
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
