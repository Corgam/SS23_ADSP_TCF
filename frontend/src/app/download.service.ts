import { Injectable } from '@angular/core';

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
            // Adds indentation of 2 spaces
            2
          ),
        ],
        { type: 'application/json' }
      )
    );
    downloadLink.download = name;
    downloadLink.click();
  }
}
