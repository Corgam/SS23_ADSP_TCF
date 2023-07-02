import { Component, Input } from '@angular/core';
import { DataType, Datafile, MediaType } from '@common/types';

@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss']
})
export class DataDisplayComponent {
  @Input({required: true})
  data!: Datafile;

  DataType = DataType;
  MediaType = MediaType;
}
