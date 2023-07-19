import { Component, Input } from '@angular/core';
import { DataType, RefDataFile } from '../../../../../common/types/datafile';
import { CollectionData } from '../services/journey.service';

interface ResultCollection {
  title: string;
  results: RefDataFile[];
}

@Component({
  selector: 'app-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.scss'],
})
export class GalleryViewComponent {
  @Input({ required: true }) set collectionsData(value: CollectionData[]) {
    this.dataSource = value.map<ResultCollection>((collectionsData) => ({
      title: collectionsData.collection.title,
      results: collectionsData.files.results
        .filter(
          (datafile) =>
            datafile.dataType === DataType.REFERENCED &&
            collectionsData.selectedFilesIds.has(datafile._id!)
        )
        .map((referencedData) => referencedData as RefDataFile),
    }));
  }

  panelOpenState = true;

  dataSource: ResultCollection[] = [];
  width = 300;

  constructor() {}
}
