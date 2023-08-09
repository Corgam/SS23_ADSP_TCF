import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FilterBlocksModule } from '../filter-blocks/filter-blocks.module';
import { MapModule } from '../map/map.module';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared/shared.module';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { CollectionComponent } from './collection/collection.component';
import { ContinueJourneyDialogComponent } from './continue-journey-dialog/continue-journey-dialog.component';
import { DataFileListEntryComponent } from './data-file-list-entry/data-file-list-entry.component';
import { GalleryViewComponent } from './gallery-view/gallery-view.component';
import { JourneyComponent } from './journey.component';
import { JourneyRoutingModule } from './journey.routing-module';
import { ThreeJSComponent } from './threejs-view/threejs-view.component';

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
    ContinueJourneyDialogComponent,
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
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class JourneyModule {}
