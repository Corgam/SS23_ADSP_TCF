import { NgModule } from "@angular/core";
import { DashboardComponent } from "./dashboard.component";
import { MaterialModule } from "../material.module";
import { CommonModule } from "@angular/common";
import { DashboardRoutingModule } from "./dashboard.routing-module";
import { SharedModule } from "../shared/shared.module";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { HttpClient } from "@angular/common/http";

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    DashboardComponent
  ],
  bootstrap: [],
  imports: [
    MaterialModule,
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    TranslateModule.forChild()
  ]
})
export class DashboardModule{}