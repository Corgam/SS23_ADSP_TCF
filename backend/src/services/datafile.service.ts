import { JsonObject } from "swagger-ui-express";
import {
  Datafile,
  DatafileCreateParams,
  DatafileFilterSetParams,
  DatafileUpdateParams,
  DataFileFilter,
  DataFileAnyFilter,
  BooleanOperation,
  FilterOperations,
  DataFileBooleanFilter,
} from "../../../common/types";
import DatafileModel from "../models/datafile.model";
import { BaseService } from "./base.service";
import { OperationNotFoundError } from "../errors";

/**
 * DatafileService
 *
 * Service class for managing Datafile entities.
 * Extends the BaseService class with specific types for Datafile CRUD operations.
 */
export default class DatafileService extends BaseService<
  Datafile,
  DatafileCreateParams,
  DatafileUpdateParams
> {
  /**
   * Constructs the DatafileService instance.
   * Initializes the BaseService with the Datafile model.
   */
  constructor() {
    super(DatafileModel);
  }

  // Creates a json of a simple DataFileFilter.
  createBasicFilterQuery(filter: DataFileFilter): JsonObject {
    // Based on the operation, create MongoDB query
    switch (filter.operation) {
      case FilterOperations.CONTAINS: {
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
      default: {
        throw new OperationNotFoundError();
      }
    }
  }

  // Creates a json of DataFileBooleanFilter
  createBooleanFilterQuery(booleanFilter: DataFileBooleanFilter): JsonObject {
    if (
      booleanFilter.booleanOperation === BooleanOperation.AND ||
      booleanFilter.booleanOperation === BooleanOperation.OR
    ) {
      // Based on the boolean operation create the key string
      const keyString =
        "$" + booleanFilter.booleanOperation.toLocaleLowerCase();
      const filters: JsonObject[] = [];
      // Create the JSON Query for each of the filters
      booleanFilter.filters.forEach((filter) => {
        filters.push(this.createBasicFilterQuery(filter));
      });
      return {
        [keyString]: filters,
      };
    } else {
      // If the boolean operation is not supported, throw an error
      throw new OperationNotFoundError();
    }
  }

  /**
   * Retrieves the list of all matching files.
   *
   * @param updateParams - The parameters to update.
   * @returns A promise that resolves to an array of all matching Datafile objects.
   */
  async getFiltered(params: DatafileFilterSetParams): Promise<Datafile[]> {
    let jsonQuery = {};
    params.filters.forEach((filter: DataFileAnyFilter) => {
      if (!("booleanOperation" in filter)) {
        // Single DataFileFilter
        jsonQuery = this.createBasicFilterQuery(filter);
      } else {
        // Boolean DataFileFilter
        jsonQuery = this.createBooleanFilterQuery(filter);
      }
    });
    return await this.model.find(jsonQuery);
  }
}
