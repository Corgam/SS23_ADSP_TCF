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
  MongooseObjectId,
  DataType,
} from "../../../../common/types";
import DatafileModel from "../../models/datafile.model";
import { BaseService } from "../base.service";
import {
  NotFoundError,
  OperationNotSupportedError,
  WrongObjectTypeError,
} from "../../errors";
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
import { handleCSVFile, handleJSONFile } from "./datafileRawParsing.service";
import { handleSimRaFile } from "./datafileDatasetParsing.service";

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
   * Appends the uploaded file to a document with given ID.
   *
   * @param file - The file to append.
   * @param documentID - The ID of the document to which to append the file
   * @param fileType - Type of the uploaded file.
   * @param dataset Optional: Type of the dataset provided
   * @returns A promise that resolves to the updated entity.
   * @throws OperationNotSupportedError if the file type is not supported.
   * @throws FailedToParseError if there was an error in parsing the file.
   * @throws WrongObjectTypeError selected document is not a NOTREFERENCED type.
   * @throws NotFoundError if the entity is not found.
   */
  override async appendFile(
    file: Express.Multer.File,
    documentID: MongooseObjectId,
    fileType: SupportedFileTypes
  ): Promise<Datafile> {
    // Create the Datafile JSON object based on file type
    let dataObject: unknown = null;
    switch (fileType) {
      //// RAW FORMATS ////
      // Handles JSON files
      case SupportedFileTypes.JSON: {
        dataObject = handleJSONFile(file);
        break;
      }
      // Handles CSV files
      case SupportedFileTypes.CSV: {
        dataObject = handleCSVFile(file);
        break;
      }
      //// SUPPORTED DATASETS ////
      // Handle SimRa files
      case SupportedFileTypes.SIMRA: {
        dataObject = handleSimRaFile(file);
        break;
      }
      // Unsupported file type
      default: {
        throw new OperationNotSupportedError("File type not supported!");
      }
    }
    // Handle errors
    const entity: Datafile | null = await this.model.findById(documentID);
    if (!entity) {
      throw new NotFoundError();
    } else if (entity.dataType !== DataType.NOTREFERENCED) {
      throw new WrongObjectTypeError(
        "Selected file needs to be a NOTREFERENCED file type."
      );
    }
    // Update the data
    const updatedEntity = await this.model.findByIdAndUpdate(documentID, {
      "content.data": dataObject,
    });
    if (!updatedEntity) {
      throw new NotFoundError();
    }
    return updatedEntity;
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
