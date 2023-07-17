import { NgModule } from '@angular/core';
import { MapComponent } from './map.component';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [MapComponent],
  imports: [
    MaterialModule,
    FormsModule,
    CommonModule,
    TranslateModule.forChild(),
  ],
  exports: [MapComponent],
})
export class MapModule {}
