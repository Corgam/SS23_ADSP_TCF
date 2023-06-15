import { Component, OnInit, AfterViewInit, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { ApiService } from "../api.service";
import { NotificationService } from "../notification.service";
import { Datafile } from "../../../../common/types/datafile";

@Component({
  selector: 'app-view-datasets',
  templateUrl: './view-datasets.component.html',
  styleUrls: ['./view-datasets.component.scss'],  
})
export class ViewDatasetsComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Datafile>([]);
  displayedColumns: string[] = ['title', 'description', 'tags', 'dataType','content', 'buttons'];

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private translate: TranslateService
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

  loadData() {
    this.apiService.getAllDatafiles().subscribe((result) => {
      this.dataSource.data = result;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    });
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

  onPageChange(event: PageEvent) {
    if (this.paginator) {
      this.paginator.pageIndex = event.pageIndex;
      this.paginator.pageSize = event.pageSize;
      this.loadData();
    }
  }
}