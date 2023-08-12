import { Component, Input } from '@angular/core';
import { DataType, RefDataFile } from '../../../../../common/types/datafile';
import { CollectionData } from '../services/journey.service';
import { Observable, combineLatest, map } from 'rxjs';

interface ResultCollection {
  title: string;
  results: RefDataFile[];
}

/**
 * This Gallery-View displays all the referenced (i.e., multimedia data) within the collections
 */
@Component({
  selector: 'app-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.scss'],
})
export class GalleryViewComponent {
  @Input({ required: true }) set collectionsData(
    value: Observable<CollectionData>[]
  ) {
    //extracts the referenced data and the title of the collections
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

  //preset width of each entry
  width = 300;

  constructor() {}
}
