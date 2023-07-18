import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TopMenuComponent } from './header/top-menu.component';
import { MaterialModule } from '../material.module';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CoordinateService } from './service/coordinate.service';
import { ApiService } from './service/api.service';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { AuthService } from './services/auth.service';

// Factory function for TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@NgModule({
  declarations: [TopMenuComponent, InputDialogComponent],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule.forChild()
  ],
  exports: [
    TopMenuComponent,
  ],
  providers: [
    CoordinateService,
    ApiService
    // AuthService
  ],
})
export class SharedModule {}
