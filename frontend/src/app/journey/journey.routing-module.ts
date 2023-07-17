import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { JourneyComponent } from "./journey.component";

const routes: Routes = [
  { path: '', component: JourneyComponent },
  { path: ':id', component: JourneyComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JourneyRoutingModule{}