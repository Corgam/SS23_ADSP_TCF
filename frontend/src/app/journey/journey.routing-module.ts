import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { JourneyComponent } from "./journey.component";
import { GalleryViewComponent } from "./gallery-view/gallery-view.component";

const routes: Routes = [
  { path: 'galleryView', pathMatch: 'full', component: GalleryViewComponent },
  { path: ':id', component: JourneyComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JourneyRoutingModule{}