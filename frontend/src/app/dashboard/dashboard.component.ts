import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(public translate: TranslateService) {
  }
  tiles = [
    {title: this.translate.instant('title.upload'), icon: 'upload', url: ''},
    {title: this.translate.instant('title.edit'), icon: 'edit', url: ''},
    {title: this.translate.instant('title.explore'), icon: 'view_in_ar', url: ''},
    {title: this.translate.instant('title.map'), icon: 'code', url: 'first-draft'},
  ]
}
