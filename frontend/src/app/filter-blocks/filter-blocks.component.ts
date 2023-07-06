import { Component, EventEmitter, Output, Input } from '@angular/core';
import {
  FilterSet,
  Filter,
  FilterOperations,
  ConcatenationFilter,
  BooleanOperation,
  AnyFilter,
  StringFilter,
} from '@common/types';
import { BehaviorSubject, map } from 'rxjs';

@Component({
  selector: 'app-filter-blocks',
  templateUrl: './filter-blocks.component.html',
  styleUrls: ['./filter-blocks.component.scss'],
})
export class FilterBlocksComponent {
  @Input() set filterSet(value: AnyFilter[]) {
    this.filterSetSubject.next(value);
  }

  @Output() onSearch = new EventEmitter<AnyFilter[]>();

  showAdvancedFilters = false;

  filterSetSubject = new BehaviorSubject<AnyFilter[]>([]);
  filterSet$ = this.filterSetSubject.asObservable();

  tagFilters$ = this.filterSet$.pipe(
    map(
      (filterSet) =>
        filterSet.filter((filter) => this.isTag(filter)) as StringFilter[]
    )
  );

  booleanOperations = Object.keys(BooleanOperation);

  toggleAdvancedFilters() {
    console.log(this.showAdvancedFilters)
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  addConcatenationFilter(filter: AnyFilter) {
    const filterSet = this.filterSetSubject.value;
    if (this.isConcatenationFilter(filter))
      filter.filters.push(this.newFilter());
    else {
      const index = filterSet.indexOf(filter);
      filterSet.splice(index, 1, {
        booleanOperation: BooleanOperation.OR,
        filters: [filter, this.newFilter()],
      });
    }
    this.filterSetSubject.next(filterSet);
  }

  removeConcatenationFilter(filter: ConcatenationFilter, concFilter: Filter) {
    const filterSet = this.filterSetSubject.value;
    const filterIndex = filterSet.indexOf(filter);
    if (filter.filters.length == 2) {
      filterSet.splice(
        filterIndex,
        1,
        ...filter.filters.filter((f) => f != concFilter)
      );
    } else {
      filter.filters.splice(filter.filters.indexOf(concFilter), 1);
    }
    this.filterSetSubject.next(filterSet);
  }

  isTag(filter: AnyFilter): filter is StringFilter {
    return (
      !this.isConcatenationFilter(filter) &&
      filter.key == 'tags' &&
      filter.negate == false &&
      filter.operation == FilterOperations.CONTAINS
    );
  }

  addFilter(tag?: string) {
    const filterSet = this.filterSetSubject.value;
    filterSet.push(this.newFilter(tag));
    this.filterSetSubject.next(filterSet);
  }

  removeFilter(filter: AnyFilter) {
    const filterSet = this.filterSetSubject.value;
    filterSet.splice(filterSet.indexOf(filter), 1);
    this.filterSetSubject.next(filterSet);
  }

  removeTag(tag: string) {
    const filterSet = this.filterSetSubject.value;
    filterSet.forEach((filter, i) => {
      if (
        !this.isConcatenationFilter(filter) &&
        filter.key == 'tags' &&
        filter.operation == FilterOperations.CONTAINS &&
        !filter.negate
      )
        filterSet.splice(i, 1);
    });
    this.filterSetSubject.next(filterSet);
  }

  newFilter(tag?: string): Filter {
    return {
      key: tag != null ? 'tags' : '',
      operation: FilterOperations.CONTAINS,
      negate: false,
      value: tag || '',
    };
  }

  isConcatenationFilter(filter: AnyFilter): filter is ConcatenationFilter {
    return Object.hasOwn(filter, 'booleanOperation');
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
