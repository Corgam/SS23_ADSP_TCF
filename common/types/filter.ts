/**
 *
 *  MAIN INTERFACES FOR FILTER
 *
 */

// Enum for different types of operations
export enum FilterOperations {
  // Strings
  CONTAINS = "CONTAINS",
  MATCHES = "MATCHES",
  // Geo-data
  RADIUS = "RADIUS",
  AREA = "AREA",
  // Boolean
  IS = "IS",
  // Numbers
  EQ = "EQ",
  GT = "GT",
  GTE = "GTE",
  LT = "LT",
  LTE = "LTE",
}

// Basic parent interface for Filter
export interface FilterAbstract {
  key: string;
  operation: FilterOperations;
  negate: boolean;
}

// Main interface represing the key-op-value filtering for datafiles, supports all operations for all data types
export type Filter = FilterAbstract &
  (StringFilter | RadiusFilter | AreaFilter | NumberFilter | BooleanFilter);

/**
 *
 *  INTERFACES FOR SPECIFIC FILTERS
 *
 */

// Filter of the STRING queries
export interface StringFilter extends FilterAbstract {
  operation: FilterOperations.CONTAINS | FilterOperations.MATCHES;
  value: string;
}

// Filter of the NUMBER queries
export interface NumberFilter extends FilterAbstract {
  operation:
    | FilterOperations.EQ
    | FilterOperations.GT
    | FilterOperations.GTE
    | FilterOperations.LT
    | FilterOperations.LTE;
  value: number;
}

// Filter of the BOOLEAN queries
export interface BooleanFilter extends FilterAbstract {
  operation: FilterOperations.IS;
  value: boolean;
}

// Filter of the RADIUS search
export interface RadiusFilter extends FilterAbstract {
  operation: FilterOperations.RADIUS;
  value: radiusOperationValue;
}

// Filter of the AREA search
export interface AreaFilter extends FilterAbstract {
  operation: FilterOperations.AREA;
  value: areaOperationValue;
}

// Interface for the value filed for RADIUS filter
export interface radiusOperationValue {
  center: number[];
  radius: number;
}

// Interface for the value filed for AREA filter
export interface areaOperationValue {
  vertices: number[][];
}
