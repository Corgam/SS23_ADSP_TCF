import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FilterSet,
  Filter,
  FilterOperations,
  ConcatenationFilter,
  BooleanOperation,
  AnyFilter,
  SupportedRawFileTypes,
} from '@common/types';
import { TranslateService } from '@ngx-translate/core';

export interface DropdownOption  {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-filter-blocks',
  templateUrl: './filter-blocks.component.html',
  styleUrls: ['./filter-blocks.component.scss'],
})
export class FilterBlocksComponent {
  @Output() onSearch = new EventEmitter<FilterSet>();
  booleanOperations = Object.keys(BooleanOperation);

  @Input()
  dropdownOptions?: DropdownOption[];

  filter: FilterSet = {
    filterSet: [],
  };

  fileFilter: Filter = {
    key: '',
    operation: FilterOperations.CONTAINS,
    negate: false,
    value: '',
  };
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
    this.filter.filterSet.push(concatenationFilter);
  }

  deleteFilter(filter: AnyFilter) {
    this.filter.filterSet.splice(this.filter.filterSet.indexOf(filter), 1);
  }

  onOperationSelectionChange(
    operationKey: keyof BooleanOperation,
    filter: ConcatenationFilter
  ) {
    filter.booleanOperation = (BooleanOperation as any)[operationKey];
  }

  search() {
    let filter: FilterSet = JSON.parse(JSON.stringify(this.filter));
    filter.filterSet.unshift(JSON.parse(JSON.stringify(this.fileFilter)));
    this.onSearch.emit(filter);
  }
}
