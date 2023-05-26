import { NgModule } from "@angular/core";
import { DashboardComponent } from "./dashboard.component";
import { DashboardTileComponent } from "./dashboard-tile/dashboard-tile.component";
import { MaterialModule } from "../material.module";
import { CommonModule } from "@angular/common";
import { DashboardRoutingModule } from "./dashboard.routing-module";
import { SharedModule } from "../shared/shared.module";
import { HttpClient } from "@angular/common/http";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardTileComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    DashboardRoutingModule,
    SharedModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ]
})
export class DashboardModule{}