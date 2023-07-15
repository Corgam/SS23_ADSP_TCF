import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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
    const exploreTitle = this.translate.instant('title.explore');
    const mapTitle = this.translate.instant('title.map');
    const viewDatasetsTitle = this.translate.instant('title.viewDatasets');
    const journeyTitle = this.translate.instant('title.journey');

    this.tiles = [
      { title: uploadTitle, icon: 'upload', url: 'upload-data' },
      { title: viewDatasetsTitle, icon: 'explore', url: 'data-sets' },
      { title: exploreTitle, icon: 'view_in_ar', url: '' },
      { title: mapTitle, icon: 'code', url: 'map' },
      { title: journeyTitle, icon: 'send', url: 'browse-journeys' },
    ];
  }
}
