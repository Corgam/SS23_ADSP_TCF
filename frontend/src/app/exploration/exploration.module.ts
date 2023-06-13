import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchMapComponent } from './search-map/search-map.component';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    SearchMapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule.forChild()
  ]
})
export class ExplorationModule { }
