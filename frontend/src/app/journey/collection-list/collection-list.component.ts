import { Component, Input } from '@angular/core';
import { Collection, Datafile, PaginationResult } from '@common/types';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss'],
})
export class CollectionListComponent {
  @Input({ required: true }) collectionFilesMap!: Map<Collection, PaginationResult<Datafile>>;
}
