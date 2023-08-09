import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  DataType,
  MediaType,
  NotRefDataFile,
  RefDataFile,
} from '@common/types';

import { Observable, delay, map, of } from 'rxjs';
import { ApiService } from '../service/api.service';

@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss'],
})
export class DataDisplayComponent implements OnChanges {
  @Input({ required: true })
  data!: RefDataFile | NotRefDataFile;

  localData$?: Observable<any>;

  @Input()
  width?: number;

  @Input()
  isDialog = false;

  DataType = DataType;
  MediaType = MediaType;

  CONVERSION_16_TO_9 = 0.5625;

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

  isYoutubeVideo(url: string): boolean {
    const possibleUrls = ['youtube.com', 'youtu.be'];
    return possibleUrls.some((possibleUrl) => url.includes(possibleUrl));
  }

  getYoutubeVideoID(url: string): string | undefined {
    if (url.includes('youtube.com')) {
      const fromIndex = url.indexOf('=') + 1;
      const toIndex = url.indexOf('&');
      return url.substring(fromIndex, toIndex);
    }
    const fromIndex = url.lastIndexOf('/') + 1;
    return url.substring(fromIndex);
  }
}
