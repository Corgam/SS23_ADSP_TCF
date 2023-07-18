import { NgModule } from '@angular/core';
import { MaterialModule } from '../material.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { JourneyComponent } from './journey.component';
import { CollectionComponent } from './collection/collection.component';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { MapModule } from '../map/map.module';
import { FilterBlocksModule } from '../filter-blocks/filter-blocks.module';
import { JourneyRoutingModule } from './journey.routing-module';
import { DataFileListEntryComponent } from './data-file-list-entry/data-file-list-entry.component';
import { ThreeJSComponent } from './threejs-view/threejs-view.component';
import { GalleryViewComponent } from './gallery-view/gallery-view.component';
import { FormsModule } from '@angular/forms';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    JourneyComponent,
    CollectionComponent,
    CollectionListComponent,
    ThreeJSComponent,
    DataFileListEntryComponent,
    GalleryViewComponent,
  ],
  bootstrap: [],
  imports: [
    MapModule,
    MaterialModule,
    CommonModule,
    SharedModule,
    FilterBlocksModule,
    TranslateModule.forChild(),
    JourneyRoutingModule,
    FormsModule
  ],
})
export class JourneyModule {}
