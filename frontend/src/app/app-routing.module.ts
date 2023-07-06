import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { NoFileUploadComponent } from './upload-data/no-file/no-file.component';
import { RawDatasetsUploadComponent } from './upload-data/rawDatasets/rawDatasets.component';
import { SupportedDataTileComponent } from './upload-data/supported-data-tile/supported-data-tile.component';
import { SupportedDatasetsUploadComponent } from './upload-data/supportedDatasets/supportedDatasets.component';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { ViewDatasetsComponent } from './view-datasets/view-datasets.component';


const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  { path: 'upload-data', component: UploadDataComponent },
  { path: 'data-sets', component: ViewDatasetsComponent },
  { path: 'data-sets/:data-set-id', component: NoFileUploadComponent },
  { path: 'map', component: MapComponent },
  { path: 'csv', component: RawDatasetsUploadComponent },
  { path: 'txt', component: RawDatasetsUploadComponent },
  { path: 'json', component: RawDatasetsUploadComponent },
  { path: 'simra', component: SupportedDatasetsUploadComponent },
  { path: 'no-file', component: NoFileUploadComponent },
  { path: 'netcdf', component: RawDatasetsUploadComponent },
  { path: 'cerv2', component: SupportedDatasetsUploadComponent },
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
