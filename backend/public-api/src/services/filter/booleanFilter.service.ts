import { BooleanFilter } from "../../../../../common/types";
import { JsonObject } from "swagger-ui-express";

/**
 * Handles the IS filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryIS(filter: BooleanFilter): JsonObject {
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
