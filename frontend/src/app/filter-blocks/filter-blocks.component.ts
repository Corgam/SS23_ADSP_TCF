import { Component, EventEmitter, Output } from '@angular/core';
import {
  DataFileFilterSet,
  DataFileFilter,
  FilterOperations,
  DataFileConcatenationFilter,
  BooleanOperation,
  DataFileAnyFilter,
} from '@common/types';

@Component({
  selector: 'app-filter-blocks',
  templateUrl: './filter-blocks.component.html',
  styleUrls: ['./filter-blocks.component.scss'],
})
export class FilterBlocksComponent {
  @Output() onSearch = new EventEmitter<DataFileFilterSet>();

  booleanOperations = Object.keys(BooleanOperation);

  filter: DataFileFilterSet = {
    filterSet: [],
  };

  fileFilter: DataFileFilter = {
    key: '',
    operation: FilterOperations.CONTAINS,
    negate: false,
    value: '',
  };

  addConcatenationFilter() {
    let concatenationFilter: DataFileConcatenationFilter = {
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
    this.filter.filterSet.push(concatenationFilter);
  }

  deleteFilter(filter: DataFileAnyFilter) {
    this.filter.filterSet.splice(this.filter.filterSet.indexOf(filter));
  }

  onOperationSelectionChange(
    operationKey: keyof BooleanOperation,
    filter: DataFileConcatenationFilter
  ) {
    filter.booleanOperation = (BooleanOperation as any)[operationKey];
  }

  search() {
    let filter: DataFileFilterSet = JSON.parse(JSON.stringify(this.filter));
    filter.filterSet.unshift(JSON.parse(JSON.stringify(this.fileFilter)));
    this.onSearch.emit(filter);
  }
}
