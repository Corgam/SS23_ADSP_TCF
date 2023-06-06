import {
  DataFileAreaFilter,
  DataFileRadiusFilter,
} from "../../../common/types";
import { JsonObject } from "swagger-ui-express";

// Handles the CONTAINS filter operation
export function createFilterQueryRadius(
  filter: DataFileRadiusFilter
): JsonObject {
  const keyString: string = filter.key;
  // Create the conditional
  let query: JsonObject = {
    $geoWithin: {
      $centerSphere: [
        [filter.value.center[0], filter.value.center[1]],
        filter.value.radius,
      ],
    },
  };

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
export function createFilterQueryArea(filter: DataFileAreaFilter): JsonObject {
  // TODO
  return {};
}
