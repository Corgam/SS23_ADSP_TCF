import { Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { Datafile } from '../../../../common/types/datafile';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-view-datasets',
  templateUrl: './view-datasets.component.html',
  styleUrls: ['./view-datasets.component.scss'],

})
export class ViewDatasetsComponent implements OnInit {
  dataSource: Datafile[] = [];
  displayedColumns: string[] = ['title', 'description', 'tags', 'dataType', 'buttons'];

  constructor(private apiService: ApiService) { }
  
  ngOnInit(): void {
    this.apiService.getData().subscribe(result => this.dataSource = result)
  }
}
