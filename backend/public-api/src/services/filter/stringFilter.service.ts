import { StringFilter } from "../../../../../common/types";
import { JsonObject } from "swagger-ui-express";
import { ObjectId } from "mongodb";

/**
 * Handles the CONTAINS filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryContains(filter: StringFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject = { $regex: filter.value, $options: "i" };
  // Check if ID is passed
  if (filter.key === "_id") {
    query = new ObjectId(filter.value);
    // Append the NOT operation
    if (filter.negate) {
      query = { $ne: query };
    }
  } else {
    // Append the NOT operation
    if (filter.negate) {
      query = { $not: query };
    }
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}

/**
 * Handles the MATCHES filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryMatches(filter: StringFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject | string = filter.value;
  // Check if ID is passed
  if (filter.key === "_id") {
    query = new ObjectId(filter.value);
  }
  // Append the NOT operation
  if (filter.negate) {
    query = { $ne: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}
