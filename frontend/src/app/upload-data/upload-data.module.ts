import { NgModule } from "@angular/core";
import { UploadDataComponent } from "./upload-data.component";
import { MaterialModule } from "../material.module";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../shared/shared.module";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { SupportedDatasetsUploadComponent } from "./supportedDatasets/supportedDatasets.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "../app-routing.module";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NoFileUploadComponent } from "./no-file/no-file.component";
import { RawDatasetsUploadComponent } from "./rawDatasets/rawDatasets.component";
import { PrimeModule } from "../prime.module";
import { MapModule } from "../map/map.module";

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    UploadDataComponent,
    NoFileUploadComponent,
    RawDatasetsUploadComponent,
    SupportedDatasetsUploadComponent
  ],
  bootstrap: [],
  imports: [
    MaterialModule,
    CommonModule,
    SharedModule,
    PrimeModule,
    MapModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forChild()
  ]
})
export class UploadDataModule{}