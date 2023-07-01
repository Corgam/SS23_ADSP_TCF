import { Filter } from "./filter";

// Enum of boolean operations used for filtering
export enum BooleanOperation {
  AND = "AND",
  OR = "OR",
}

// Interface representing a single filter with required boolean logic.
export interface ConcatenationFilter {
  booleanOperation: BooleanOperation;
  filters: Filter[];
}

// Type representing an filter, which optionally can contain boolean logic.
export type AnyFilter = Filter | ConcatenationFilter;

// Interface represing a set of filters. Also supports boolean operations.
export interface FilterSet {
  filterSet: AnyFilter[];
}

// Type representing the parameters required for filtering.
export type FilterSetParams = Pick<FilterSet, "filterSet">;
