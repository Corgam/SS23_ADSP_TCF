import { AfterViewInit, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, iif, map } from 'rxjs';
import { AnyFilter, Journey } from '../../../../common/types';
import { DownloadService } from '../download.service';
import { DropdownOption } from '../filter-blocks/filter-blocks.component';
import { NotificationService } from '../notification.service';
import { ApiService } from '../shared/service/api.service';

@Component({
  selector: 'app-browse-journey',
  templateUrl: './browse-journey.component.html',
  styleUrls: ['./browse-journey.component.scss'],
})
export class BrowseJourneyComponent implements AfterViewInit {
  dataSource : Journey[] = [];
  displayedColumns: string[] = [
    'title',
    'description',
    'tags',
    'author',
    'buttons',
  ];

  totalCount?: number;
  skip = 0;
  limit = 10;

  dropdownOptions: DropdownOption[] = [
    { value: 'title', viewValue: this.translate.instant('journey.title') },
    { value: 'description', viewValue: this.translate.instant('journey.description') },
    { value: 'tags', viewValue: this.translate.instant('journey.tags') },
    { value: 'author', viewValue: this.translate.instant('journey.author') },
  ];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private downloadService: DownloadService
  ) {}

  ngAfterViewInit() {
    this.loadData();
  }

  loadData(filter?: AnyFilter[]) {
   iif(() => filter != null, this.apiService.filterJourneys({filterSet: filter!},this.limit, this.skip), this.apiService.getJourneys(this.limit, this.skip)).subscribe((result) => {
      this.dataSource = result.results;
      this.totalCount = result.totalCount;
    });
  }

  downloadAll() {
    this.downloadService.download(this.dataSource, 'data.json');
  }

  delete(id: string) {
    this.apiService.deleteJourney(id).subscribe(() => {
      const deleteSuccessMessage = this.translate.instant(
        'viewAllJourney.deleteSuccess'
      );
      this.notificationService.showInfo(deleteSuccessMessage);
      this.notificationService.showInfo("Journey deleted");
      this.loadData();
    });
  }

  getContentAsString(content: any): string {
    const text = JSON.stringify(content);
    return text.length > 75 ? `${text.slice(0, 75)} ...` : text;
  }

  onPageChange(event: PageEvent) {
    this.limit = event.pageSize;
    this.skip = this.limit * event.pageIndex
    this.loadData();
  }

  download(journey: Journey){
    const observableList = journey.collections.map(collection => {
      return this.apiService.filterDatafiles(({filterSet: collection.filterSet }), 10_000_000, 0)
    })

    forkJoin(observableList)
    .pipe(
      map(resultList => resultList.map(pageinationResult => pageinationResult.results))
    ).subscribe({
      next: resultData => this.downloadService.download(resultData, journey.title),
      error: () => {
        const downloadFailedMessage = this.translate.instant('browseJourney.downloadFailed');
        this.notificationService.showInfo(downloadFailedMessage)
      }})
  }
}
