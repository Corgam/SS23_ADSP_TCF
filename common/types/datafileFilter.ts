// Enum for different types of operations
export enum FilterOperations {
  contains = "contains",
}

// Interface represing the key-op-value filtering for datafiles
export interface DataFileFilter {
  key: string;
  operation: FilterOperations;
  value: string;
}

// Type representing the parameters required for filtering the Datafiles.
export type DatafileFilteringParams = Pick<
  DataFileFilter,
  "key" | "operation" | "value"
>;
