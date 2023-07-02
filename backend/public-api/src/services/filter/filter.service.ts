import {
  BooleanOperation,
  ConcatenationFilter,
  Filter,
  FilterOperations,
  JsonObject,
} from "../../../../../common/types";
import {
  createFilterQueryContains,
  createFilterQueryMatches,
} from "../filter/stringFilter.service";
import {
  createFilterQueryRadius,
  createFilterQueryArea,
} from "../filter/geodataFilter.service";
import {
  createFilterQueryGTE,
  createFilterQueryGT,
  createFilterQueryLT,
  createFilterQueryLTE,
  createFilterQueryEQ,
} from "../filter/numberFilter.service";
import { createFilterQueryIS } from "./booleanFilter.service";
import { OperationNotSupportedError } from "../../errors";

/**
 * Creates a MongoDB query from DataFileFilter object.
 *
 * @param filter - Filter JSON object to create a query.
 * @returns MongoDB query
 */
export function createBasicFilterQuery(filter: Filter): JsonObject {
  // Based on the operation, create MongoDB query
  switch (filter.operation) {
    // String
    case FilterOperations.CONTAINS: {
      return createFilterQueryContains(filter);
    }
    case FilterOperations.MATCHES: {
      return createFilterQueryMatches(filter);
    }
    // Geo-data
    case FilterOperations.RADIUS: {
      return createFilterQueryRadius(filter);
    }
    case FilterOperations.AREA: {
      return createFilterQueryArea(filter);
    }
    // Number
    case FilterOperations.EQ: {
      return createFilterQueryEQ(filter);
    }
    case FilterOperations.GT: {
      return createFilterQueryGT(filter);
    }
    case FilterOperations.GTE: {
      return createFilterQueryGTE(filter);
    }
    case FilterOperations.LT: {
      return createFilterQueryLT(filter);
    }
    case FilterOperations.LTE: {
      return createFilterQueryLTE(filter);
    }
    // Boolean
    case FilterOperations.IS: {
      return createFilterQueryIS(filter);
    }
    // Operation not supported
    default: {
      throw new OperationNotSupportedError();
    }
  }
}

/**
 * Creates a MongoDB query from DataFileBooleanFilter object.
 * Uses MongoDB's aggregation function.
 *
 * @param filter - Filter JSON object to create a query.
 * @returns MongoDB query
 */
export function createConcatenationFilterQuery(
  concatenationFilter: ConcatenationFilter
): JsonObject {
  if (
    concatenationFilter.booleanOperation === BooleanOperation.AND ||
    concatenationFilter.booleanOperation === BooleanOperation.OR
  ) {
    // Based on the boolean operation create the key string
    const keyString =
      "$" + concatenationFilter.booleanOperation.toLocaleLowerCase();
    const filters: JsonObject[] = [];
    // Create the JSON Query for each of the filters
    concatenationFilter.filters.forEach((filter) => {
      filters.push(createBasicFilterQuery(filter));
    });
    return {
      [keyString]: filters,
    };
  } else {
    // If the boolean operation is not supported, throw an error
    throw new OperationNotSupportedError();
  }
}
