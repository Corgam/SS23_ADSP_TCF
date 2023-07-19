import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterOutlet } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { JourneyModule } from './journey/journey.module';
import { MaterialModule } from './material.module';
import { PrimeModule } from './prime.module';
import { SharedModule } from './shared/shared.module';
import { ViewDatasetsComponent } from './view-datasets/view-datasets.component';
import { BrowseJourneyComponent } from './browse-journey/browse-journey.component';
import { MapModule } from './map/map.module';
import { FilterBlocksModule } from './filter-blocks/filter-blocks.module';
import { UploadDataModule } from './upload-data/upload-data.module';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { environment } from 'src/environments/environment.development';


// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    AppComponent,
    ViewDatasetsComponent,
    BrowseJourneyComponent,
  ],
  exports:[
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    PrimeModule,
    YouTubePlayerModule,
    MapModule,
    RouterOutlet,
    DashboardModule,
    JourneyModule,
    SharedModule,
    MapModule,
    UploadDataModule,
    FilterBlocksModule,
    TranslateModule.forRoot({
      defaultLanguage: 'de',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
  ],  
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }