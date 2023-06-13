import { Component, Input } from '@angular/core';
import { DataFileFilter, FilterOperations } from '@common/types';

@Component({
  selector: 'app-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
})
export class FilterBlockComponent {
  @Input({ required: true }) fileFilter!: DataFileFilter;

  filterOperations = Object.keys(FilterOperations);

  onOperationSelectionChange(operationKey: keyof FilterOperations) {
    this.fileFilter.operation = (FilterOperations as any)[operationKey];
  }

  toggleNegate() {
    this.fileFilter.negate = !this.fileFilter.negate;
  }
}
