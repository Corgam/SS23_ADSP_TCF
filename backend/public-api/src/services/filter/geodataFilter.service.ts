import { AreaFilter, RadiusFilter } from "../../../../../common/types";
import { JsonObject } from "swagger-ui-express";

/**
 * Handles the RADIUS filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryRadius(filter: RadiusFilter): JsonObject {
  const keyString: string = filter.key;
  // Create the conditional
  let query: JsonObject = {
    $geoWithin: {
      $centerSphere: [
        [filter.value.center[0], filter.value.center[1]],
        filter.value.radius / 6378.1, // Divide radians by equatorial radius of the Earth to get km
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

/**
 * Handles the AREA filter operation
 * @param filter the provided filter
 * @returns mongoDB query
 */
export function createFilterQueryArea(filter: AreaFilter): JsonObject {
  const keyString: string = filter.key;
  // Create the conditional
  let query: JsonObject = {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [filter.value.vertices],
      },
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
