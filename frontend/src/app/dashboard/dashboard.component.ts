import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  tiles: any[] = [];

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.initializeTiles();
    });

    this.initializeTiles();
  }

  initializeTiles() {
    const uploadTitle = this.translate.instant('title.upload');
    const editTitle = this.translate.instant('title.edit');
    const exploreTitle = this.translate.instant('title.explore');
    const mapTitle = this.translate.instant('title.map');
  
    this.tiles = [
      { title: uploadTitle, icon: 'upload', url: '' },
      { title: editTitle, icon: 'edit', url: '' },
      { title: exploreTitle, icon: 'view_in_ar', url: '' },
      { title: mapTitle, icon: 'code', url: 'first-draft' }
    ];
  }
}
