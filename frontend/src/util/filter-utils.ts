import {
  AnyFilter,
  AreaFilter,
  ConcatenationFilter,
  Filter,
  FilterOperations,
  RadiusFilter,
} from '@common/types';

export function isFilter(filter: AnyFilter): filter is Filter {
  return filter.hasOwnProperty('key');
}

export function isConcatenationFilter(
  filter: AnyFilter
): filter is ConcatenationFilter {
  return filter.hasOwnProperty('booleanOperation');
}

export function isAreaFilter(filter: AnyFilter): filter is AreaFilter {
  return isFilter(filter) && filter.operation == FilterOperations.AREA;
}

export function isRadiusFilter(filter: AnyFilter): filter is RadiusFilter {
  return isFilter(filter) && filter.operation == FilterOperations.RADIUS;
}

export function isMapFilter(
  filter: AnyFilter
): filter is AreaFilter | RadiusFilter {
  return (
    isFilter(filter) &&
    (filter.operation == FilterOperations.AREA ||
      filter.operation == FilterOperations.RADIUS)
  );
}

export function isBooleanFilter(filter: AnyFilter) {
  return isFilter(filter) && filter.operation == FilterOperations.IS;
}

export function isStringFilter(filter: AnyFilter) {
  return (
    isFilter(filter) &&
    (filter.operation == FilterOperations.MATCHES ||
      filter.operation == FilterOperations.CONTAINS)
  );
}

export function isNumberFilter(filter: AnyFilter) {
  return (
    isFilter(filter) &&
    (filter.operation == FilterOperations.EQ ||
      filter.operation == FilterOperations.GT ||
      filter.operation == FilterOperations.GTE ||
      filter.operation == FilterOperations.LT ||
      filter.operation == FilterOperations.LTE)
  );
}
