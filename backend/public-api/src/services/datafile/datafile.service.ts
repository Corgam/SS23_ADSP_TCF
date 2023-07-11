import {
  Datafile,
  DatafileCreateParams,
  FilterSetParams,
  DatafileUpdateParams,
  AnyFilter,
  SupportedRawFileTypes,
  MongooseObjectId,
  DataType,
  SupportedDatasetFileTypes,
  PaginationResult,
} from "../../../../../common/types";
import DatafileModel from "../../models/datafile.model";
import { CrudService } from "../crud.service";
import {
  NotFoundError,
  OperationNotSupportedError,
  WrongObjectTypeError,
} from "../../errors";
import { PipelineStage } from "mongoose";
import {
  handleCSVFile,
  handleJSONFile,
  handleTXTFile,
} from "./datafileRawParsing.service";
import { handleSimRaFile } from "./datafileSimraParsing.service";
import {
  createBasicFilterQuery,
  createConcatenationFilterQuery,
} from "../filter/filter.service";
import { parsePath } from "../../utils/utils";

/**
 * DatafileService
 *
 * Service class for managing Datafile entities.
 * Extends the BaseService class with specific types for Datafile CRUD operations.
 */
export default class DatafileService extends CrudService<
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
   * Retrieves all entities.
   * @param onlyMetadata When returning objects, the data is skipped and only the metadata is returned.
   * @param skip Pagination, number of documents to skip (no. page)
   * @param limit Pagination, number of documents to return (page size)
   * @returns A PaginationResult object, containing results
   */
  async getAllExtended(
    onlyMetadata: boolean,
    skip: number,
    limit: number
  ): Promise<PaginationResult<Datafile>> {
    // Create commands array
    const commandsArray: Array<PipelineStage> = [];
    commandsArray.push({ $match: {} });
    commandsArray.push({ $skip: skip });
    commandsArray.push({ $limit: limit });
    // If only metadata is returned delete the data
    if (onlyMetadata) {
      commandsArray.push({ $unset: "content.data" });
    }
    const results = await this.model.aggregate(commandsArray).exec();
    const totalCount = await this.model.count({}).exec();
    return {
      skip: skip,
      limit: limit,
      totalCount: totalCount,
      results: results,
    };
  }

  /**
   * Appends the uploaded file to a document with given ID.
   *
   * @param file - The file to append.
   * @param documentID - The ID of the document to which to append the file
   * @param fileType - Type of the uploaded file.
   * @returns A promise that resolves to the updated entity.
   * @throws OperationNotSupportedError if the file type is not supported.
   * @throws FailedToParseError if there was an error in parsing the file.
   * @throws WrongObjectTypeError selected document is not a NOTREFERENCED type.
   * @throws NotFoundError if the entity is not found.
   */
  async attachFile(
    file: Express.Multer.File,
    documentID: MongooseObjectId,
    fileType: SupportedRawFileTypes
  ): Promise<Datafile> {
    // Create the Datafile JSON object based on file type
    let dataObject: unknown = null;
    switch (fileType) {
      // Handles JSON files
      case SupportedRawFileTypes.JSON: {
        dataObject = handleJSONFile(file);
        break;
      }
      // Handles CSV files
      case SupportedRawFileTypes.CSV: {
        dataObject = handleCSVFile(file);
        break;
      }
      case SupportedRawFileTypes.TXT: {
        dataObject = handleTXTFile(file);
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
    const updatedEntity = await this.model.findByIdAndUpdate(
      documentID,
      {
        "content.data": { dataObject },
      },
      { new: true, upsert: true }
    );
    if (!updatedEntity) {
      throw new NotFoundError();
    }
    return updatedEntity;
  }

  /**
   * Creates all datafiles from the uploaded dataset file
   *
   * @param file - The file to append.
   * @param dataset - Type of the dataset provided.
   * @param tags - Optional tags to be appended to all created documents, seperated by commas.
   * @param description - Optional description to be added to all created documents.
   * @returns A promise that resolves to all created entities.
   * @throws OperationNotSupportedError if the dataset type is not supported.
   */
  async createFromFile(
    file: Express.Multer.File,
    dataset: SupportedDatasetFileTypes,
    tags?: string,
    description?: string
  ): Promise<Datafile[]> {
    // Create the Datafile JSON object based on file type
    let documents: unknown[] = [];
    switch (dataset) {
      // Handles SimRa files
      case SupportedDatasetFileTypes.SIMRA: {
        documents = await handleSimRaFile(file, tags, description);
        break;
      }
      // Unsupported dataset
      default: {
        throw new OperationNotSupportedError("Dataset not supported!");
      }
    }
    // Create all documents
    return this.model.create(documents);
  }

  /**
   * Retrieves the list of all matching files.
   *
   * @param filterSetParams - Object containing an array of filters to be executed.
   * @param skip Pagination, number of documents to skip (no. page)
   * @param limit Pagination, number of documents to return (page size)
   * @param onlyMetadata When returning objects, the data is skipped and only the metadata is returned.
   * @returns A PaginationResult object, containing results
   */
  async getFiltered(
    filterSetParams: FilterSetParams,
    skip: number,
    limit: number,
    onlyMetadata: boolean
  ): Promise<PaginationResult<Datafile>> {
    const jsonQueries: PipelineStage[] = [];
    filterSetParams.filterSet.forEach((filter: AnyFilter) => {
      if (!("booleanOperation" in filter)) {
        // Single DataFileFilter
        jsonQueries.push({ $match: createBasicFilterQuery(filter) });
      } else {
        // Boolean Concatenation DataFileFilter
        jsonQueries.push({
          $match: createConcatenationFilterQuery(filter),
        });
      }
    });
    // Get the count
    const totalCount = await this.model.aggregate(jsonQueries).exec();
    // Pagination
    jsonQueries.push({ $skip: skip });
    jsonQueries.push({ $limit: limit });
    // If only metadata is returned delete the data
    if (onlyMetadata) {
      jsonQueries.push({ $unset: "content.data" });
    }
    // Get the result
    const results = await this.model.aggregate(jsonQueries).exec();
    return {
      skip: skip,
      limit: limit,
      totalCount: totalCount.length,
      results: results,
    };
  }

  async updateNestedValue(
    documentId: MongooseObjectId,
    path: string,
    value: unknown
  ): Promise<Datafile> {
    const document = await this.model.findByIdAndUpdate(
      documentId,
      { [parsePath(path)]: value },
      { new: true, upsert: true }
    );
    if (!document) {
      throw new NotFoundError();
    }
    return document;
  }

  async getNestedValue(
    documentId: MongooseObjectId,
    path: string,
    deleteValue: boolean
  ): Promise<unknown> {
    const keyValue = parsePath(path)
      .split(".") // Splits path on "."
      .filter(Boolean) // removes empty strings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .reduce((obj: any, key: string) => {
        return obj && obj[key];
      }, await this.get(documentId));
    if (!keyValue) {
      throw new NotFoundError(`no key is found for the path ${path}`);
    }
    if (deleteValue) {
      await this.model.findByIdAndUpdate(
        documentId,
        {
          $unset: { [parsePath(path)]: keyValue },
        },
        { new: true, upsert: true }
      );
    }
    return keyValue;
  }
}
