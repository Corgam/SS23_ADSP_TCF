import { NgModule } from "@angular/core";
import { UploadDataComponent } from "./upload-data.component";
import { RawDataTileComponent } from "./raw-data-tile/raw-data-tile.component";
import { MaterialModule } from "../material.module";
import { CommonModule } from "@angular/common";
import { UploadDataRoutingModule } from "./upload-data.routing-module";
import { SharedModule } from "../shared/shared.module";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NoFileUploadComponent } from "./no-file/no-file.component";
import { NetCDFUploadComponent } from "./netCDF/netCDF.component";
import { TXTUploadComponent } from "./txt/txt.component";
import { CSVUploadComponent } from "./csv/csv.component";
import { JSONUploadComponent } from "./json/json.component";
import { SupportedDataTileComponent } from "./supported-data-tile/supported-data-tile.component";
import { SimraUploadComponent } from "./simra/simra.component";
import { CerV2UploadComponent } from "./cerv2/cerv2.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "../app-routing.module";
import { PrimeModule } from "../prime.module";

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    UploadDataComponent,
    RawDataTileComponent,
    SupportedDataTileComponent,
    NoFileUploadComponent,
    NetCDFUploadComponent,
    TXTUploadComponent,
    CSVUploadComponent,
    JSONUploadComponent,
    SimraUploadComponent,
    CerV2UploadComponent

  ],
  bootstrap: [],
  imports: [
    MaterialModule,
    CommonModule,
    UploadDataRoutingModule,
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    PrimeModule,
    HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forChild()
  ]
})
export class UploadDataModule{}