import { Component, Input } from '@angular/core';
import { DataType, RefDataFile } from '../../../../../common/types/datafile';
import { CollectionData } from '../services/journey.service';
import { Observable, combineLatest, map } from 'rxjs';

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
  @Input({ required: true }) set collectionsData(
    value: Observable<CollectionData>[]
  ) {
    this.dataSource$ = combineLatest(value).pipe(
      map((collectionsData) =>
        collectionsData.map<ResultCollection>((collectionsData) => ({
          title: collectionsData.collection.title,
          results: collectionsData.files.results
            .filter(
              (datafile) =>
                datafile.dataType === DataType.REFERENCED &&
                collectionsData.selectedFilesIds.has(datafile._id!)
            )
            .map((referencedData) => referencedData as RefDataFile),
        }))
      )
    );
  }

  panelOpenState = true;

  dataSource$?: Observable<ResultCollection[]>;
  width = 300;

  constructor() {}
}
