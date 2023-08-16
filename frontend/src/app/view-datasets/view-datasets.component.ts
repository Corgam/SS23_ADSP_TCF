import { AfterViewInit, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Datafile, FilterSet } from '@common/types';
import { TranslateService } from '@ngx-translate/core';
import { iif } from 'rxjs';
import { DownloadService } from '../download.service';
import { NotificationService } from '../notification.service';
import { ApiService } from '../shared/service/api.service';

/**
 * Allows to browse, filter, update, and delete data points
 */
@Component({
  selector: 'app-view-datasets',
  templateUrl: './view-datasets.component.html',
  styleUrls: ['./view-datasets.component.scss'],
})
export class ViewDatasetsComponent implements AfterViewInit {
  dataSource : Datafile[] = [];
  displayedColumns: string[] = [
    'title',
    'description',
    'tags',
    'dataType',
    'content',
    'buttons',
  ];

  totalCount?: number;
  skip = 0;
  limit = 10;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private downloadService: DownloadService
  ) {}

  ngAfterViewInit() {
    this.loadData();
  }

  /**
   * If a filter is present, the filter endpoint is called, otherwise the "normal" endpoint
   * @param filter the currently applied filters
   */
  loadData(filter?: FilterSet) {
   iif(() => filter != null, this.apiService.filterDatafiles(filter!,this.limit, this.skip, true), this.apiService.getDatafiles(this.limit, this.skip, true)).subscribe((result) => {
      this.dataSource = result.results;
      this.totalCount = result.totalCount;
    });
  }

  downloadByID(id: string) {
    const jsonObject = this.dataSource.find((item) => item._id == id);
    this.downloadService.download(jsonObject, `${jsonObject?.title}.json`);
  }

  downloadAll() {
    this.downloadService.download(this.dataSource, 'data.json');
  }

  delete(id: string) {
    this.apiService.deleteDatafile(id).subscribe(() => {
      const deleteSuccessMessage = this.translate.instant(
        'viewAllDatafiles.deleteSuccess'
      );
      this.notificationService.showInfo(deleteSuccessMessage);
      this.notificationService.showInfo("Datafile deleted");
      this.loadData();
    });
  }

  /** Truncates the content after 75 characters */
  getContentAsString(content: any): string {
    const text = JSON.stringify(content);
    return text.length > 75 ? `${text.slice(0, 75)} ...` : text;
  }

  onPageChange(event: PageEvent) {
    this.limit = event.pageSize;
    this.skip = this.limit * event.pageIndex
    this.loadData();
  }
}
