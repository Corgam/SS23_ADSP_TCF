import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopMenuComponent } from './header/top-menu.component';
import { MaterialModule } from '../material.module';
import { MapComponent } from './map/map.component';
import { CoordinateService } from './map/service/coordinate.service';



@NgModule({
  declarations: [
    TopMenuComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  exports: [
    TopMenuComponent,
    MapComponent
  ],
  providers: [
    CoordinateService
  ],
})
export class SharedModule { }
