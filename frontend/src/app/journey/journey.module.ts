import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { FilterBlocksModule } from "../filter-blocks/filter-blocks.module";
import { MapModule } from "../map/map.module";
import { MaterialModule } from "../material.module";
import { SharedModule } from "../shared/shared.module";
import { CollectionListComponent } from './collection-list/collection-list.component';
import { CollectionComponent } from './collection/collection.component';
import { GalleryViewComponent } from './gallery-view/gallery-view.component';
import { JourneyComponent } from "./journey.component";
import { JourneyRoutingModule } from "./journey.routing-module";

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [
    JourneyComponent,
    CollectionComponent,
    CollectionListComponent,
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
export class JourneyModule{}