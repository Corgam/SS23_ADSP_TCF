import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import {
  AnyFilter,
  AreaFilter,
  BooleanOperation,
  ConcatenationFilter,
  Filter,
  FilterOperations,
  RadiusFilter,
  StringFilter,
} from '@common/types';
import {
  BehaviorSubject,
  combineLatest,
  map
} from 'rxjs';
import { isConcatenationFilter, isMapFilter } from '../../util/filter-utils';

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
  @Input() set filterSet(value: AnyFilter[]) {
    this.filterSetSubject.next(value);
  }

  @Output() onSearch = new EventEmitter<AnyFilter[]>();
  @Output() onChange = new EventEmitter();

  @Input()
  dropdownOptions?: DropdownOption[];

  showAdvancedFilters = false;

  filterSetSubject = new BehaviorSubject<AnyFilter[]>([]);
  filterSet$ = this.filterSetSubject.asObservable();

  tagFilters$ = this.filterSet$.pipe(
    map(
      (filterSet) =>
        filterSet.filter((filter) => this.isTag(filter)) as StringFilter[]
    )
  );

  hasAdvancedFilters$ = combineLatest(this.filterSet$, this.tagFilters$).pipe(
    map(([filterSet, tagFilters]) => [
      filterSet,
      tagFilters,
      filterSet.filter(
        (filter) =>
          isMapFilter(filter) &&
          filter.negate == false &&
          filter.key == 'content.location'
      ) as (AreaFilter | RadiusFilter)[],
    ]),
    map(
      ([filterSet, tagFilters, mapFilters]) =>
        filterSet.length !== tagFilters.length + mapFilters.length
    )
  );

  booleanOperations = Object.keys(BooleanOperation);

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  addConcatenationFilter(filter: AnyFilter) {
    const filterSet = this.filterSetSubject.value;
    if (isConcatenationFilter(filter)) filter.filters.push(this.newFilter());
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
    this.triggerFilterChange();
  }

  isTag(filter: AnyFilter): filter is StringFilter {
    return (
      !isConcatenationFilter(filter) &&
      filter.key == 'tags' &&
      filter.negate == false &&
      filter.operation == FilterOperations.CONTAINS
    );
  }

  addTag(event: MatChipInputEvent) {
    let tag = (event.value || '').trim();
    this.addFilter(tag);
    event.chipInput!.clear();
  }

  removeTag(tag: string) {
    const filterSet = this.filterSetSubject.value;
    filterSet.forEach((filter, i) => {
      if (
        !isConcatenationFilter(filter) &&
        filter.key == 'tags' &&
        filter.operation == FilterOperations.CONTAINS &&
        !filter.negate &&
        filter.value == tag
      )
        this.removeFilter(filter);
    });
  }

  addFilter(tag?: string) {
    const filterSet = this.filterSetSubject.value;
    filterSet.push(this.newFilter(tag));
    this.triggerFilterChange();
  }

  removeFilter(filter: AnyFilter) {
    const filterSet = this.filterSetSubject.value;
    filterSet.splice(filterSet.indexOf(filter), 1);
    this.triggerFilterChange();
  }

  newFilter(tag?: string): Filter {
    return {
      key: tag != null ? 'tags' : '',
      operation: FilterOperations.CONTAINS,
      negate: false,
      value: tag || '',
    };
  }

  search() {
    this.onSearch.emit(this.filterSetSubject.value);
  }

  triggerFilterChange() {
    this.filterSetSubject.next(this.filterSetSubject.value);
    this.onChange.emit();
  }

  isConcatenationFilter(filter: AnyFilter): filter is ConcatenationFilter {
    return isConcatenationFilter(filter);
  }
}
