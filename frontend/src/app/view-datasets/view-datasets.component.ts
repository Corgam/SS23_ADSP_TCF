import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../api.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-view-datasets',
  templateUrl: './view-datasets.component.html',
  styleUrls: ['./view-datasets.component.scss'],
})
export class ViewDatasetsComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['title', 'description', 'tags', 'dataType','content', 'buttons'];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loadData() {
    this.apiService.getAllDatafiles().subscribe((result) => {
      this.dataSource.data = result;
    });
    console.log(this.dataSource);
  }

  delete(id: string) {
    this.apiService.deleteDatafile(id).subscribe(() => {
      const deleteSuccessMessage = this.translate.instant('viewAllDatafiles.deleteSuccess');
      this.notificationService.showInfo(deleteSuccessMessage);
      //this.notificationService.showInfo("Datafile deleted");
      this.loadData();
    });
  }

  getContentAsString(content: any): string {
    const text = JSON.stringify(content);
    return text.length > 75 ? `${text.slice(0,75)} ...` : text;
  }
}
