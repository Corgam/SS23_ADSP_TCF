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
  DataFileConcatenationFilter,
} from "../../../common/types";
import DatafileModel from "../models/datafile.model";
import { BaseService } from "./base.service";
import { OperationNotFoundError } from "../errors";
import { PipelineStage } from "mongoose";
import {
  createFilterQueryContains,
  createFilterQueryMatches,
} from "./datafileStringFilter.service";
import {
  createFilterQueryRadius,
  createFilterQueryArea,
} from "./datafileGeoFilter.service";
import {
  createFilterQueryGTE,
  createFilterQueryGT,
  createFilterQueryLT,
  createFilterQueryLTE,
  createFilterQueryEQ,
} from "./datafileNumberFilter.service";
import { createFilterQueryIS } from "./datafileBooleanFilter.service";

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
      // String
      case FilterOperations.CONTAINS: {
        return createFilterQueryContains(filter);
      }
      case FilterOperations.MATCHES: {
        return createFilterQueryMatches(filter);
      }
      // Geo-data
      case FilterOperations.RADIUS: {
        return createFilterQueryRadius(filter);
      }
      case FilterOperations.AREA: {
        return createFilterQueryArea(filter);
      }
      // Number
      case FilterOperations.EQ: {
        return createFilterQueryEQ(filter);
      }
      case FilterOperations.GT: {
        return createFilterQueryGT(filter);
      }
      case FilterOperations.GTE: {
        return createFilterQueryGTE(filter);
      }
      case FilterOperations.LT: {
        return createFilterQueryLT(filter);
      }
      case FilterOperations.LTE: {
        return createFilterQueryLTE(filter);
      }
      // Boolean
      case FilterOperations.IS: {
        return createFilterQueryIS(filter);
      }
      // Operation not supported
      default: {
        throw new OperationNotFoundError();
      }
    }
  }

  // Creates a json of DataFileBooleanFilter
  createConcatenationFilterQuery(
    concatenationFilter: DataFileConcatenationFilter
  ): JsonObject {
    if (
      concatenationFilter.booleanOperation === BooleanOperation.AND ||
      concatenationFilter.booleanOperation === BooleanOperation.OR
    ) {
      // Based on the boolean operation create the key string
      const keyString =
        "$" + concatenationFilter.booleanOperation.toLocaleLowerCase();
      const filters: JsonObject[] = [];
      // Create the JSON Query for each of the filters
      concatenationFilter.filters.forEach((filter) => {
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
   * @param filterSetParams - Object containing an array of filters to be executed.
   * @returns A promise that resolves to an array of all matching Datafile objects.
   */
  async getFiltered(
    filterSetParams: DatafileFilterSetParams
  ): Promise<Datafile[]> {
    const jsonQueries: PipelineStage[] = [];
    filterSetParams.filterSet.forEach((filter: DataFileAnyFilter) => {
      if (!("booleanOperation" in filter)) {
        // Single DataFileFilter
        jsonQueries.push({ $match: this.createBasicFilterQuery(filter) });
      } else {
        // Boolean Concatenation DataFileFilter
        jsonQueries.push({
          $match: this.createConcatenationFilterQuery(filter),
        });
      }
    });
    return await this.model.aggregate(jsonQueries);
  }
}
