import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopMenuComponent } from './header/top-menu.component';
import { MaterialModule } from '../material.module';
import { MapComponent } from './map/map.component';



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
  ],
})
export class SharedModule { }
