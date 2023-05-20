import { Component, Input } from '@angular/core';
import { DataType } from '@shared/types/data-type'

@Component({
  selector: 'app-data-display',
  templateUrl: './data-display.component.html',
  styleUrls: ['./data-display.component.scss']
})
export class DataDisplayComponent<T> {
  @Input({required: true})
  data!: T;
  @Input({required: true})
  type!: DataType;

  DataType = DataType;
}
