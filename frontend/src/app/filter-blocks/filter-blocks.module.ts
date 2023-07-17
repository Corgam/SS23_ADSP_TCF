import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MaterialModule } from '../material.module';
import { FilterBlockComponent } from './filter-block/filter-block.component';
import { FilterBlocksComponent } from './filter-blocks.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditMapFilterDialogComponent } from './edit-map-filter-dialog/edit-map-filter-dialog.component';
import { MapModule } from '../map/map.module';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [FilterBlockComponent, FilterBlocksComponent, EditMapFilterDialogComponent],
  bootstrap: [],
  imports: [
    MaterialModule,
    MapModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule.forChild(),
  ],
  exports: [FilterBlocksComponent],
})
export class FilterBlocksModule {}
