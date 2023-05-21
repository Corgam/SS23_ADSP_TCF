import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FirstDraftComponent } from './first-draft/first-draft.component';
import { MaterialModule } from './material.module';
import { AppService } from './first-draft/services/app.service';
import { GeoService } from './first-draft/services/geo.service';
import { ControlsComponent } from './first-draft/components/controls/controls.component';
import { TopMenuComponent } from './header/top-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    ControlsComponent,
    FirstDraftComponent,
    TopMenuComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterOutlet,
    DashboardModule
  ],
  providers: [
    AppService,
    GeoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
