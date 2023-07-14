import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Collection, Datafile, PaginationResult } from '@common/types';
import { JourneyService } from '../services/journey.service';
import { Observable, map } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
})
export class CollectionComponent implements OnChanges {
  @Input({ required: true }) collection!: Collection;
  @Input({ required: true }) dataFiles!: PaginationResult<Datafile>;
  @Input({ required: true }) color!: string;

  isSelected$?: Observable<boolean>;

  isOneSelected$?: Observable<boolean>;
  isAllSelected$?: Observable<boolean>;

  constructor(private journeyService: JourneyService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataFiles'] && this.dataFiles != null) {
      const ids = this.dataFiles.results.map((file) => file._id!);
      this.isAllSelected$ = this.journeyService.isSelected$(...ids);
      this.isOneSelected$ = this.journeyService.isOneSelected$(...ids);
      this.isSelected$ = this.journeyService.selectedCollection$.pipe(
        map((collection) => collection == this.collection)
      );
    }
  }

  selectCollection() {
    this.journeyService.selectCollection(this.collection);
  }

  selectCollectionFiles(change: MatCheckboxChange) {
    if (change.checked)
      this.journeyService.selectDataFiles(...this.dataFiles.results);
    else this.journeyService.deselectDataFiles(...this.dataFiles.results);
  }
}
