import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { MapComponent } from './map/map.component';
import { ViewDatasetsComponent } from './view-datasets/view-datasets.component';
import { JourneyComponent } from './journey/journey.component';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  { path: 'upload', component: UploadDataComponent },
  { path: 'journey', component: JourneyComponent },
  { path: 'data-sets', component: ViewDatasetsComponent },
  { path: 'data-sets/:data-set-id', component: UploadDataComponent },
  { path: 'map', component: MapComponent },
  { path: '**', redirectTo: '/dashboard', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
