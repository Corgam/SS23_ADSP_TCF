import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../api.service';
import { NotificationService } from '../notification.service';
import { Datafile } from '../../../../common/types/datafile';
import { DownloadService } from '../download.service';
import { FilterSet } from '../../../../common/types';

@Component({
  selector: 'app-view-datasets',
  templateUrl: './view-datasets.component.html',
  styleUrls: ['./view-datasets.component.scss'],
})
export class ViewDatasetsComponent implements AfterViewInit {
  dataSource = new MatTableDataSource<Datafile>([]);
  displayedColumns: string[] = [
    'title',
    'description',
    'tags',
    'dataType',
    'content',
    'buttons',
  ];

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private downloadService: DownloadService
  ) {}

  ngAfterViewInit() {
    this.loadData();
  }

  ngOnInit(): void {
    this.loadData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  search(filter: FilterSet) {
    console.log(filter);
    this.apiService.filterDatafiles(filter).subscribe((result) => {
      this.dataSource.data = result;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  loadData() {
    const limit = this.paginator?.pageSize ?? 10;
    const skip = limit * (this.paginator?.pageIndex ?? 0);

    //TODO set limit and skip 
    this.apiService.getAllDatafiles().subscribe((result) => {
      this.dataSource.data = result;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
  }

  downloadByID(id: string) {
    const jsonObject = this.dataSource.data.find((item) => item._id == id);
    this.downloadService.download(jsonObject, `${jsonObject?.title}.json`);
  }

  downloadAll() {
    this.downloadService.download(this.dataSource.data, 'data.json');
  }

  delete(id: string) {
    this.apiService.deleteDatafile(id).subscribe(() => {
      const deleteSuccessMessage = this.translate.instant(
        'viewAllDatafiles.deleteSuccess'
      );
      this.notificationService.showInfo(deleteSuccessMessage);
      //this.notificationService.showInfo("Datafile deleted");
      this.loadData();
    });
  }

  getContentAsString(content: any): string {
    const text = JSON.stringify(content);
    return text.length > 75 ? `${text.slice(0, 75)} ...` : text;
  }

  onPageChange(event: PageEvent) {
    if (this.paginator) {
      this.paginator.pageIndex = event.pageIndex;
      this.paginator.pageSize = event.pageSize;
      this.loadData();
    }
  }
}
