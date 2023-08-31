import { Injectable } from '@angular/core';
import { Journey } from '../../../common/types';
import { ApiService } from './shared/service/api.service';
import { NotificationService } from './notification.service';
import { forkJoin, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

/**
 * This Service allows the download of data.
 * The downloadable file is not created in the backend, but rather right here in the frontend.
 */
@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  /**
   * Downloads all data files from each collection in a single JSON file.
   * ExcludedIds on the journey are recognized and will not be downloaded.
   * @param journey journey to download files from
   * @param excludedIds optional excluded ids. The excludedIds on the journey will be ignored and these will be recognized instead
   */
  downloadJourney(journey: Journey, excludedIds?: Set<string>) {
    const observableList = journey.collections.map((collection) => {
      //Journey only saves the "receipe" -> get data points based on filters stored in journey
      return this.apiService.filterDatafiles(
        { filterSet: collection.filterSet },
        10_000_000,
        0
      );
    });

    forkJoin(observableList)
      .pipe(
        // map pagination result and filter excluded ids
        map((resultList) =>
          resultList.map((pageinationResult) =>
            pageinationResult.results.filter((result) =>
              excludedIds != null
                ? !excludedIds.has(result._id!)
                : !journey.excludedIDs.includes(result._id!)
            )
          )
        )
      )
      .subscribe({
        next: (resultData) => this.downloadAsJSON(resultData, journey.title),
        error: () => {
          const downloadFailedMessage = this.translate.instant(
            'browseJourney.downloadFailed'
          );
          this.notificationService.showInfo(downloadFailedMessage);
        },
      });
  }
  /**
   * Downloads data as a JSON by creating a ghost anchor element with a download link connected to an object blob url.
   * @param dataObject data to download
   * @param name suggested name to save file under
   */
  downloadAsJSON(dataObject: any, name: string) {
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            dataObject,
            null,
            2 // Adds indentation of 2 spaces
          ),
        ],
        { type: 'application/json' }
      )
    );
    downloadLink.download = name;
    downloadLink.click();
  }
}
