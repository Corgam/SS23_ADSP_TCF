import { DataFileNumberFilter } from "../../../common/types";
import { JsonObject } from "swagger-ui-express";

// Handles the EQ filter operation
export function createFilterQueryEQ(filter: DataFileNumberFilter): JsonObject {
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

// Handles the GT filter operation
export function createFilterQueryGT(filter: DataFileNumberFilter): JsonObject {
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

// Handles the GTE filter operation
export function createFilterQueryGTE(filter: DataFileNumberFilter): JsonObject {
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

// Handles the LT filter operation
export function createFilterQueryLT(filter: DataFileNumberFilter): JsonObject {
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

// Handles the LTE filter operation
export function createFilterQueryLTE(filter: DataFileNumberFilter): JsonObject {
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
