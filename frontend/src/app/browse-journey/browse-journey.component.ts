import { AfterViewInit, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { iif } from 'rxjs';
import { FilterSet, Journey } from '../../../../common/types';
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

  loadData(filter?: FilterSet) {
   iif(() => filter != null, this.apiService.filterJourneys(filter!,this.limit, this.skip), this.apiService.getJourneys(this.limit, this.skip)).subscribe((result) => {
      this.dataSource = result.results;
      this.totalCount = result.totalCount;
    });
  }

  downloadByID(id: string) {
    const jsonObject = this.dataSource.find((item) => item.parentID == id);
    this.downloadService.download(jsonObject, `${jsonObject?.title}.json`);
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
}
