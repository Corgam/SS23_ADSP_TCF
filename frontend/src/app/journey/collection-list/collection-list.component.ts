import { Component, Input } from '@angular/core';
import { Collection, Datafile, PaginationResult } from '@common/types';
import { CollectionData } from '../services/journey.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss'],
})
export class CollectionListComponent {
  @Input({ required: true }) collectionsData!: Observable<CollectionData>[];
}
