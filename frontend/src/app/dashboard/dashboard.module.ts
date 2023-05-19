import { NgModule } from "@angular/core";
import { DashboardComponent } from "./dashboard.component";
import { DashboardTileComponent } from "./dashboard-tile/dashboard-tile.component";
import { MaterialModule } from "../material.module";
import { CommonModule } from "@angular/common";
import { DashboardRoutingModule } from "./dashboard.routing-module";

@NgModule({
  declarations: [
    DashboardComponent,
    DashboardTileComponent
  ],
  imports: [
    MaterialModule,
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule{}