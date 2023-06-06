import { Location } from "./datafile";

/**
 *
 *  MAIN INTERFACES FOR DATAFILE FILTER
 *
 */

// Enum for different types of operations
export enum FilterOperations {
  CONTAINS = "CONTAINS",
  MATCHES = "MATCHES",
  RADIUS = "RADIUS",
  AREA = "AREA",
}

// Basic parent interface for DataFileFilter
export interface DataFileAbstract {
  key: string;
  operation: FilterOperations;
  negate: boolean;
}

// Main interface represing the key-op-value filtering for datafiles, supports all operations for all data types
export type DataFileFilter = DataFileAbstract &
  (DataFileStringFilter | DataFileRadiusFilter | DataFileAreaFilter);

/**
 *
 *  INTERFACES FOR SPECIFIC FILTERS
 *
 */

// Filter of the STRING queries
export interface DataFileStringFilter extends DataFileAbstract {
  operation: FilterOperations.CONTAINS | FilterOperations.MATCHES;
  value: string;
}

// Filter of the RADIUS search
export interface DataFileRadiusFilter extends DataFileAbstract {
  operation: FilterOperations.RADIUS;
  value: radiusOperationValue;
}

// Filter of the AREA search
export interface DataFileAreaFilter extends DataFileAbstract {
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
  vertices: Location[];
}
