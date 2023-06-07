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
  SupportedFileTypes,
} from "../../../../common/types";
import DatafileModel from "../../models/datafile.model";
import { BaseService } from "../base.service";
import { OperationNotSupportedError } from "../../errors";
import { PipelineStage } from "mongoose";
import {
  createFilterQueryContains,
  createFilterQueryMatches,
} from "../filter/stringFilter.service";
import {
  createFilterQueryRadius,
  createFilterQueryArea,
} from "../filter/geodataFilter.service";
import {
  createFilterQueryGTE,
  createFilterQueryGT,
  createFilterQueryLT,
  createFilterQueryLTE,
  createFilterQueryEQ,
} from "../filter/numberFilter.service";
import { createFilterQueryIS } from "../filter/booleanFilter.service";
import { handleCSVFile, handleJSONFile } from "./datafileFileParsing.service";

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

  /**
   * Handles creation of datafile based on a file type
   *
   * @param file - The file to create a datafile from.
   * @param fileType - Type of the uploaded file.
   * @returns A promise that resolves to the created entity.
   */
  override async createFromFile(
    file: Express.Multer.File,
    fileType: SupportedFileTypes
  ): Promise<Datafile> {
    // Create the Datafile JSON object based on file type
    let jsonObject: unknown = null;
    switch (fileType) {
      // Handles JSON files
      case SupportedFileTypes.JSON: {
        jsonObject = handleJSONFile(file);
        break;
      }
      // Handles CSV files
      case SupportedFileTypes.CSV: {
        jsonObject = handleCSVFile(file);
        break;
      }
      // Unsupported file type
      default: {
        throw new OperationNotSupportedError("File type not supported!");
      }
    }
    const entity = this.model.create(jsonObject);
    return entity;
  }

  /**
   * Creates a MongoDB query from DataFileFilter object.
   *
   * @param filter - Filter JSON object to create a query.
   * @returns MongoDB query
   */
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
        throw new OperationNotSupportedError();
      }
    }
  }

  /**
   * Creates a MongoDB query from DataFileBooleanFilter object.
   * Uses MongoDB's aggregation function.
   *
   * @param filter - Filter JSON object to create a query.
   * @returns MongoDB query
   */
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
      throw new OperationNotSupportedError();
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
