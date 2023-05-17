import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FirstDraftComponent } from './first-draft/first-draft.component';
import { DashboardTileComponent } from './dashboard/dashboard-tile/dashboard-tile.component';
import { MaterialModule } from 'src/app/material.module';



@NgModule({
  declarations: [
    DashboardComponent,
    FirstDraftComponent,
    DashboardTileComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    DashboardComponent
  ]
})
export class LibModule { }
