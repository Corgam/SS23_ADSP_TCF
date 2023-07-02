import { StringFilter } from "../../../../../common/types";
import { JsonObject } from "swagger-ui-express";

// Handles the CONTAINS filter operation
export function createFilterQueryContains(filter: StringFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject = { $regex: filter.value, $options: "i" };
  // Append the NOT operation
  if (filter.negate) {
    query = { $not: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}

// Handles the MATCHES filter operation
export function createFilterQueryMatches(filter: StringFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject | string = filter.value;
  // Append the NOT operation
  if (filter.negate) {
    query = { $ne: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}
