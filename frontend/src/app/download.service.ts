import { Injectable } from '@angular/core';

/**
 * This Service allows the download of data.
 * The downloadable file is not created in the backend, but rather right here in the frontend.
 */
@Injectable({
  providedIn: 'root',
})
export class DownloadService {
  constructor() {}

  download(dataObject: any, name: string) {
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
