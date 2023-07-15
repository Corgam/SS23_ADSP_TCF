import { Component, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FilterSet,
  Filter,
  FilterOperations,
  ConcatenationFilter,
  BooleanOperation,
  AnyFilter,
  SupportedRawFileTypes,
  DropdownOption,
} from '@common/types';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-filter-blocks',
  templateUrl: './filter-blocks.component.html',
  styleUrls: ['./filter-blocks.component.scss'],
})
export class FilterBlocksComponent {
  @Output() onSearch = new EventEmitter<FilterSet>();
  booleanOperations = Object.keys(BooleanOperation);

  filter: FilterSet = {
    filterSet: [],
  };

  fileFilter: Filter = {
    key: '',
    operation: FilterOperations.CONTAINS,
    negate: false,
    value: '',
  };

  dropdownOptions: DropdownOption[] = [];

  constructor(private translate: TranslateService) {  
    this.initializeDropdownOptions();
  }

  private initializeDropdownOptions() {
    this.dropdownOptions = [
      { value: 'title', viewValue: this.translate.instant('journey.title') },
      { value: 'description', viewValue: this.translate.instant('journey.description') },
      { value: 'tags', viewValue: this.translate.instant('journey.tags') },
      { value: 'author', viewValue: this.translate.instant('journey.author') },
    ];
  }


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
