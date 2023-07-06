import { Component, Input } from '@angular/core';
import { DataType, MediaType, NotRefDataFile, RefDataFile } from '@common/types';

/**
 * https://github.com/angular/components/tree/main/src/youtube-player
 * last accessed, 06.07.2023: 21:23
 */
@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss']
})
export class DataDisplayComponent {
  @Input({required: true})
  data!: RefDataFile | NotRefDataFile;

  @Input()
  width?: number;

  DataType = DataType;
  MediaType = MediaType;

  CONVERSION_16_TO_9 = 0.5625;

  isYoutubeVideo(url: string): boolean{
    const possibleUrls = ["youtube.com", "youtu.be"]
    return possibleUrls.some(possibleUrl => url.includes(possibleUrl))
  }

  getYoutubeVideoID(url: string): string | undefined{
    if(url.includes("youtube.com")) {
      const fromIndex = url.indexOf("=") + 1;
      const toIndex = url.indexOf("&");
      return url.substring(fromIndex, toIndex);
    }
    const fromIndex = url.lastIndexOf("/") + 1;
    return url.substring(fromIndex);
  }
}
