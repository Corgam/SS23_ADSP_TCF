import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { NoFileUploadComponent } from './upload-data/no-file/no-file.component';
import { RawDatasetsUploadComponent } from './upload-data/rawDatasets/rawDatasets.component';
import { SupportedDatasetsUploadComponent } from './upload-data/supportedDatasets/supportedDatasets.component';
import { UploadDataComponent } from './upload-data/upload-data.component';
import { ViewDatasetsComponent } from './view-datasets/view-datasets.component';
import { BrowseJourneyComponent } from './browse-journey/browse-journey.component';
import {
  AuthGuard,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth/login']);

const redirectLoggedInToDashboard = () => redirectLoggedInTo(['dashboard']);

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'upload',
    component: UploadDataComponent,
  },
  {
    path: 'journey',
    loadChildren: () =>
      import('./journey/journey.module').then((m) => m.JourneyModule),
  },
  { path: 'upload-data', component: UploadDataComponent },
  { path: 'data-sets', component: ViewDatasetsComponent },
  { path: 'data-sets/:data-set-id', component: NoFileUploadComponent },
  { path: 'browse-journeys', component: BrowseJourneyComponent },
  // { path: 'journey/:journey-id', component: ? },
  { path: 'map', component: MapComponent },
  { path: 'upload-data/csv', component: RawDatasetsUploadComponent },
  { path: 'upload-data/txt', component: RawDatasetsUploadComponent },
  { path: 'upload-dataset/csv', component: SupportedDatasetsUploadComponent },
  { path: 'upload-data/json', component: RawDatasetsUploadComponent },
  { path: 'upload-dataset/simra', component: SupportedDatasetsUploadComponent },
  { path: 'upload-data/no-file', component: NoFileUploadComponent },
  { path: 'upload-data/netcdf', component: RawDatasetsUploadComponent },
  { path: 'upload-dataset/cerv2', component: SupportedDatasetsUploadComponent },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectLoggedInToDashboard },
  },
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
