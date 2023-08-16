import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * This component is the start page of the application and offers the user
 * different tiles, i.e., links to different components.
 */
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
    const journeyTitle = this.translate.instant('title.journey');
    const viewDatasetsTitle = this.translate.instant('title.viewDatasets');
    const browseJourneyTitle = this.translate.instant('title.browseJourney');

    //the URL directs to the components. The routes can be found in the app-routing.module.ts
    this.tiles = [
      { title: uploadTitle, icon: 'upload', url: 'upload-data' },
      { title: viewDatasetsTitle, icon: 'explore', url: 'data-sets' },
      { title: journeyTitle, icon: 'view_in_ar', url: 'journey' },
      { title: browseJourneyTitle, icon: 'send', url: 'browse-journeys' },
    ];
  }
}
