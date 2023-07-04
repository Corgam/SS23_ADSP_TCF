import { Component, EventEmitter, Output, Input } from '@angular/core';
import {
  FilterSet,
  Filter,
  FilterOperations,
  ConcatenationFilter,
  BooleanOperation,
  AnyFilter,
} from '@common/types';

@Component({
  selector: 'app-filter-blocks',
  templateUrl: './filter-blocks.component.html',
  styleUrls: ['./filter-blocks.component.scss'],
})
export class FilterBlocksComponent {
  @Input() filterSet: AnyFilter[] = [];

  @Output() onSearch = new EventEmitter<AnyFilter[]>();

  booleanOperations = Object.keys(BooleanOperation);

  addConcatenationFilter() {
    let concatenationFilter: ConcatenationFilter = {
      booleanOperation: BooleanOperation.AND,
      filters: [
        {
          key: '',
          operation: FilterOperations.CONTAINS,
          negate: false,
          value: '',
        },
      ],
    };
    this.filterSet.push(concatenationFilter);
  }

  deleteFilter(filter: AnyFilter) {
    this.filterSet.splice(this.filterSet.indexOf(filter), 1);
  }

  onOperationSelectionChange(
    operationKey: keyof BooleanOperation,
    filter: ConcatenationFilter
  ) {
    filter.booleanOperation = (BooleanOperation as any)[operationKey];
  }

  search() {
    let filterSet: AnyFilter[] = JSON.parse(JSON.stringify(this.filterSet));
    this.onSearch.emit(filterSet);
  }
}
