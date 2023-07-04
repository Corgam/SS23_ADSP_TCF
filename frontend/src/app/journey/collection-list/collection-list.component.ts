import { Component, Input } from '@angular/core';
import { Collection } from '@common/types';

@Component({
  selector: 'app-collection-list',
  templateUrl: './collection-list.component.html',
  styleUrls: ['./collection-list.component.scss'],
})
export class CollectionListComponent {
  @Input() collections: Collection[] = [];
}
