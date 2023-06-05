import { DataFileFilter } from "../../../common/types";
import { JsonObject } from "swagger-ui-express";

// Handles the CONTAINS filter operation
export function createFilterQueryContains(filter: DataFileFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let regex: JsonObject = { $regex: filter.value, $options: "i" };
  // Append the NOT operation
  if (filter.negate) {
    regex = { $not: regex };
  }
  // Return the final json query
  return {
    [keyString]: regex,
  };
}

// Handles the MATCHES filter operation
export function createFilterQueryMatches(filter: DataFileFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let regex: JsonObject | string = filter.value;
  // Append the NOT operation
  if (filter.negate) {
    regex = { $ne: regex };
  }
  // Return the final json query
  return {
    [keyString]: regex,
  };
}