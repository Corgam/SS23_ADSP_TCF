import { NgModule } from '@angular/core';
import { MapComponent } from './map.component';
import { MaterialModule } from '../material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CoordinateService } from '../shared/service/coordinate.service';

@NgModule({
  declarations: [MapComponent],
  imports: [
    MaterialModule,
    FormsModule,
    CommonModule,
    TranslateModule.forChild(),
  ],
  providers: [CoordinateService],
  exports: [MapComponent],
})
export class MapModule {}
