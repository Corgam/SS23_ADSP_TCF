import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { ViewDatasetsComponent } from './view-datasets/view-datasets.component';
import { CSVUploadComponent } from './upload-data/csv/csv.component';
import { TXTUploadComponent } from './upload-data/txt/txt.component';
import { JSONUploadComponent } from './upload-data/json/json.component';
import { SimraUploadComponent } from './upload-data/simra/simra.component';
import { NoFileUploadComponent } from './upload-data/no-file/no-file.component';
import { NetCDFUploadComponent } from './upload-data/netCDF/netCDF.component';
import { CerV2UploadComponent } from './upload-data/cerv2/cerv2.component';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  { path: 'upload-file', component: UploadDataComponent },
  { path: 'data-sets', component: ViewDatasetsComponent },
  { path: 'data-sets/:data-set-id', component: UploadDataComponent },
  { path: 'map', component: MapComponent },
  { path: 'csv', component: CSVUploadComponent },
  { path: 'txt', component: TXTUploadComponent },
  { path: 'json', component: JSONUploadComponent },
  { path: 'simra', component: SimraUploadComponent },
  { path: 'no-file', component: NoFileUploadComponent },
  { path: 'netcdf', component: NetCDFUploadComponent },
  { path: 'cerv2', component: CerV2UploadComponent },
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
