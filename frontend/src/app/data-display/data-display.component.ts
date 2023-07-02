import { Component, Input } from '@angular/core';
import { DataType, MediaType, NotRefDataFile, RefDataFile } from '@common/types';

@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss']
})
export class DataDisplayComponent {
  @Input({required: true})
  data!: RefDataFile | NotRefDataFile;

  DataType = DataType;
  MediaType = MediaType;
}
