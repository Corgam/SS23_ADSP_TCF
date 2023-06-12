import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchMapComponent } from './search-map/search-map.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';


@NgModule({
  declarations: [
    SearchMapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
  ]
})
export class ExplorationModule { }
