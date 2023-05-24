import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopMenuComponent } from './header/top-menu.component';
import { MaterialModule } from '../material.module';
import { ControlsComponent } from './map/components/controls/controls.component';
import { MapComponent } from './map/map.component';
import { AppService } from './map/services/app.service';
import { GeoService } from './map/services/geo.service';



@NgModule({
  declarations: [
    TopMenuComponent,
    ControlsComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    TopMenuComponent,
    ControlsComponent,
    MapComponent
  ],
  providers: [
    AppService,
    GeoService
  ],
})
export class SharedModule { }
