import { NumberFilter } from "../../../../../common/types";
import { JsonObject } from "swagger-ui-express";

/**
 * Handles the EQ filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryEQ(filter: NumberFilter): JsonObject {
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

/**
 * Handles the GT filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryGT(filter: NumberFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject = { $gt: filter.value };
  // Append the NOT operation
  if (filter.negate) {
    query = { $not: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}

/**
 * Handles the GTE filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryGTE(filter: NumberFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject = { $gte: filter.value };
  // Append the NOT operation
  if (filter.negate) {
    query = { $not: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}

/**
 * Handles the LT filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryLT(filter: NumberFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject = { $lt: filter.value };
  // Append the NOT operation
  if (filter.negate) {
    query = { $not: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}

/**
 * Handles the LTE filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryLTE(filter: NumberFilter): JsonObject {
  const keyString = filter.key;
  // Create the conditional
  let query: JsonObject = { $lte: filter.value };
  // Append the NOT operation
  if (filter.negate) {
    query = { $not: query };
  }
  // Return the final json query
  return {
    [keyString]: query,
  };
}
