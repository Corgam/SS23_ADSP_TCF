import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from 'src/lib/dashboard/dashboard.component';
import { FirstDraftComponent } from 'src/lib/first-draft/first-draft.component';

const routes: Routes = [
  { path: '',   redirectTo: '/start', pathMatch: 'full' },
  { path: 'start', component: DashboardComponent },
  { path: 'first-draft', component: FirstDraftComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
