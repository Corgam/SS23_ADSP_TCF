import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Datafile } from '../../../../common/types/datafile';
import { ApiService } from '../api.service';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-view-datasets',
  templateUrl: './view-datasets.component.html',
  styleUrls: ['./view-datasets.component.scss'],

})
export class ViewDatasetsComponent implements OnInit {
  dataSource: Datafile[] = [];
  displayedColumns: string[] = ['title', 'description', 'tags', 'dataType', 'buttons'];

  constructor(private apiService: ApiService, private notificationService: NotificationService) {
   }
  
  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.apiService.getAllDatafiles().subscribe(result => this.dataSource = result);
  }

  delete(id: string) {
    this.apiService.deleteDatafile(id).subscribe(() => {this.notificationService.showInfo("Datafile deleted"); this.loadData()});
  }
}
