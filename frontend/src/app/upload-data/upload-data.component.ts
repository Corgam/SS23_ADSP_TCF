import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Contains the dashboard tiles for the different uploads.
 */
@Component({
  selector: 'app-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.scss']
})
export class UploadDataComponent implements OnInit {
  rawTiles: any[] = [];
  supportedTiles: any[] = [];

  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      this.initializeTiles();
    });

    this.initializeTiles();
  }

  initializeTiles() {
    const noFile = this.translate.instant('title.noFile');
    const json = this.translate.instant('title.json');
    const csv = this.translate.instant('title.csv');
    const txt = this.translate.instant('title.txt');
    const netCDF = this.translate.instant('title.netCDF');
    const simra = this.translate.instant('title.simra');
    const cerV2 = this.translate.instant('title.cerv2');

    this.rawTiles = [
      { title: noFile, icon: 'create_new_folde', url: 'upload-data/no-file' },
      { title: json, icon: 'cloud_upload', url: 'upload-data/json' },
      { title: csv, icon: 'attach_file', url: 'upload-data/csv' },
      { title: txt, icon: 'text_format', url: 'upload-data/txt' },
      { title: netCDF, icon: 'code', url: 'upload-data/netcdf' }
    ];

    this.supportedTiles = [
      { title: simra, icon: 'directions_bike', url: 'upload-dataset/simra' },
      { title: cerV2, icon: 'developer_board', url: 'upload-dataset/cerv2' },
      { title: csv, icon: 'attach_file', url: 'upload-dataset/csv' }
    ];
  }
}
