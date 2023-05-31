// Enum for different types of operations
export enum FilterOperations {
  CONTAINS = "CONTAINS",
}

// Interface represing the key-op-value filtering for datafiles
export interface DataFileFilter {
  key: string;
  operation: FilterOperations;
  value: string;
  negate: boolean;
}