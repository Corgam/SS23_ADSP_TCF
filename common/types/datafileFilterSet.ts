import { DataFileFilter } from "./datafileFilter";

// Enum of boolean operations used for filtering
export enum BooleanOperation {
  AND = "AND",
  OR = "OR",
}

// Interface representing a single filter with required boolean logic.
export interface DataFileBooleanFilter {
  booleanOperation: BooleanOperation;
  filters: DataFileFilter[];
}

// Type representing an filter, which optionally can contain boolean logic.
export type DataFileAnyFilter = DataFileFilter | DataFileBooleanFilter;

// Interface represing a set of filters. Also supports boolean operations.
export interface DataFileFilterSet {
  filterSet: DataFileAnyFilter[];
}

// Type representing the parameters required for filtering the Datafiles.
export type DatafileFilterSetParams = Pick<DataFileFilterSet, "filterSet">;
