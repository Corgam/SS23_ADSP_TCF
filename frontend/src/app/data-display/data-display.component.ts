import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  DataType,
  MediaType,
  NotRefDataFile,
  RefDataFile,
} from '@common/types';
import { ApiService } from '../shared/service/api.service';
import { Observable, delay, of } from 'rxjs';

@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss'],
})
export class DataDisplayComponent implements OnChanges {
  @Input({ required: true })
  data!: RefDataFile | NotRefDataFile;

  localData$?: Observable<any>;

  constructor(private apiService: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['data'] || this.data == null) return;
    if (
      this.data.dataType == DataType.NOTREFERENCED &&
      this.data.content.data == null
    ) {
      this.localData$ = this.apiService.getDatafile(this.data._id!);
    } else {
      this.localData$ = of((this.data as NotRefDataFile).content.data);
    }
  }

  DataType = DataType;
  MediaType = MediaType;
}
