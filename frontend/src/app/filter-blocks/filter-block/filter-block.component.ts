import { Component, Input } from '@angular/core';
import { AnyFilter, Filter, FilterOperations } from '@common/types';

@Component({
  selector: 'app-filter-block',
  templateUrl: './filter-block.component.html',
  styleUrls: ['./filter-block.component.scss'],
})
export class FilterBlockComponent {
  @Input({ required: true }) filter!: Filter;

  filterOperations = Object.keys(FilterOperations);

  onOperationSelectionChange(operationKey: keyof FilterOperations) {
    this.filter.operation = (FilterOperations as any)[operationKey];
  }

  toggleNegate() {
    this.filter.negate = !this.filter.negate;
  }
}
