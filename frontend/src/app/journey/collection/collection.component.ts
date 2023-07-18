import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Collection, Datafile, PaginationResult } from '@common/types';
import { JourneyService } from '../services/journey.service';
import { Observable, Subject, filter, map, tap } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { InputDialogComponent } from '../../shared/input-dialog/input-dialog.component';

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
  triggerExpandSubject = new Subject<boolean>();

  constructor(
    private journeyService: JourneyService,
    private dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataFiles'] && this.dataFiles != null) {
      const ids = this.dataFiles.results.map((file) => file._id!);
      this.isAllSelected$ = this.journeyService.isSelected$(...ids);
      this.isOneSelected$ = this.journeyService.isOneSelected$(...ids);
      this.isSelected$ = this.journeyService.selectedCollection$.pipe(
        map((collection) => collection == this.collection)
      );
      this.isSelected$
        .pipe(filter((isSelected) => isSelected))
        .subscribe(this.triggerExpandSubject);
    }
  }

  afterCollapse() {
    this.triggerExpandSubject.next(false);
  }

  editTitle() {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      data: {
        label: 'collection.collection-title',
        value: this.collection.title,
        placeholder: 'collection.collection-title-placeholder',
      },
    });

    dialogRef.afterClosed().subscribe((newTitle) => {
      if (newTitle == null) return;
      this.collection.title = newTitle;
    });
  }

  selectCollection() {
    this.journeyService.selectCollection(this.collection);
  }

  deleteCollection() {
    this.journeyService.deleteCollection(this.collection);
  }

  selectCollectionFiles(change: MatCheckboxChange) {
    if (change.checked)
      this.journeyService.selectDataFiles(...this.dataFiles.results);
    else this.journeyService.deselectDataFiles(...this.dataFiles.results);
  }
}
