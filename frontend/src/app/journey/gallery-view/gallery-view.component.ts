import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DataType, Datafile, MediaType, NotRefDataFile, Ref, RefDataFile } from '../../../../../common/types/datafile';
import { CollectionData } from '../services/journey.service';

interface ResultCollection {
  title: string,
  results: RefDataFile[]
}

@Component({
  selector: 'app-gallery-view',
  templateUrl: './gallery-view.component.html',
  styleUrls: ['./gallery-view.component.scss']
})
export class GalleryViewComponent implements OnChanges{

  @Input({ required: true }) collectionsData!: CollectionData[];
  panelOpenState = true;

  dataSource : ResultCollection[] = []
  width = 300;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = this.collectionsData.map<ResultCollection>(collectionContainer => ({
      title: collectionContainer.collection.title,
      results: collectionContainer.files.results.filter(datafile => datafile.dataType === DataType.REFERENCED).map(referencedData => referencedData as RefDataFile)
    }))
  }
}