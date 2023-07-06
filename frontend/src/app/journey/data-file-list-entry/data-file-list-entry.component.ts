import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Datafile } from '@common/types';
import { JourneyService } from '../services/journey.service';
import { Observable } from 'rxjs';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-data-file-list-entry',
  templateUrl: './data-file-list-entry.component.html',
  styleUrls: ['./data-file-list-entry.component.scss'],
})
export class DataFileListEntryComponent implements OnChanges {
  @Input({ required: true }) file!: Datafile;

  isSelected$?: Observable<boolean>;

  constructor(private journeyService: JourneyService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['file'] &&
      changes['file'].previousValue?._id != changes['file'].currentValue?._id
    )
      this.isSelected$ = this.journeyService.isSelected$(this.file._id!);
  }

  select(change: MatCheckboxChange) {
    if (change.checked) this.journeyService.selectDataFiles(this.file);
    else this.journeyService.deselectDataFiles(this.file);
  }
}
