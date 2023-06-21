import { DataFileBooleanFilter } from "../../../../../common/types";
import { JsonObject } from "swagger-ui-express";

// Handles the IS filter operation
export function createFilterQueryIS(filter: DataFileBooleanFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject = { $eq: filter.value };
  // Append the NOT operation
  if (filter.negate) {
    query = { $not: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}
