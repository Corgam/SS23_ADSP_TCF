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
  NotRefDataFile,
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
import NetCDFJsonBucketService from "../bucket/netcdfBucket.service";
import { handleCERV2File } from "./datafileCERV2.service";
import NetcdfApi from "../netcdfApi.service";

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
  readonly netCDFbucketService : Readonly<NetCDFJsonBucketService> =
    new NetCDFJsonBucketService();

  /**
   * Constructs the DatafileService instance.
   * Initializes the BaseService with the Datafile model.
   */
  constructor() {
    super(DatafileModel);
  }

  override async get(id: string): Promise<Datafile> {
    const datafile = await super.get(id);

    if (
      "data" in datafile.content &&
      datafile.content?.data?.dataObject?.dataId
    ) {
      try {
        const fileData = await this.netCDFbucketService.downloadFile(
          datafile._id as string
        );
        datafile.content.data.dataObject.data = fileData;
        delete datafile.content.data.dataObject.dataId;
      } catch (error) {
        console.error("Error while reading file data:", error);
      }
    }

    return datafile;
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

    const datafiles = results.map(async (datafile) => {
      if (
        "data" in datafile.content &&
        datafile.content?.data?.dataObject?.dataId
      ) {
        try {
          const fileData = await this.netCDFbucketService.downloadFile(
            datafile._id as string
          );
          datafile.content.data.dataObject.data = fileData;
          delete datafile.content.data.dataObject.dataId;
        } catch (error) {
          console.error("Error while reading file data:", error);
        }
      }
      return datafile;
    });

    const resultsWithNetCDF = await Promise.all(datafiles);

    const totalCount = await this.model.count({}).exec();
    return {
      skip: skip,
      limit: limit,
      totalCount: totalCount,
      results: resultsWithNetCDF,
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
    let dataObject: any;
    let updatedEntity: NotRefDataFile | null = null;
    let largeFileData: unknown;

    // Check if the document is a NOTREFERENCED type
    const entity: Datafile | null = await this.model.findById(documentID);
    if (!entity) {
      throw new NotFoundError();
    } else if (entity.dataType !== DataType.NOTREFERENCED) {
      throw new WrongObjectTypeError(
        "Selected file needs to be a NOTREFERENCED file type."
      );
    }

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
      case SupportedRawFileTypes.NETCDF: {
        // get netcdf metadata
        const metadata = await NetcdfApi.getMetaData(file);
        // get netcdf large data
        largeFileData = await NetcdfApi.getFileData(file);

        // upload raw data to bucket
        const dataId = await this.netCDFbucketService.uploadFile(
          documentID,
          largeFileData
        );

        dataObject = { netCdfInfo: metadata, dataId };
        break;
      }
      // Unsupported file type
      default: {
        throw new OperationNotSupportedError("File type not supported!");
      }
    }

    if (dataObject) {
      updatedEntity = await this.attachDataToFile(documentID, dataObject);

      if (largeFileData) {
        delete updatedEntity.content.data.dataObject.dataId;
        updatedEntity.content.data.dataObject.data = largeFileData;
      }
    }

    if (!updatedEntity) {
      throw new NotFoundError();
    }
    return updatedEntity;
  }

  attachDataToFile(
    documentID: string,
    dataObject: any
  ): Promise<NotRefDataFile> {
    // Update the data
    return this.model.findByIdAndUpdate(
      documentID,
      {
        "content.data": { dataObject },
      },
      { new: true, upsert: true }
    );
  }

  /**
   * Creates all datafiles from the uploaded dataset file.
   * Each subfunction for handling specific datasets should create the documents themself.
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
    description?: string,
    steps?: string
  ): Promise<Datafile[]> {
    // Create the Datafile JSON object based on file type
    let createdDocuments: Datafile[] = [];
    switch (dataset) {
      // Handles SimRa files
      case SupportedDatasetFileTypes.SIMRA: {
        createdDocuments = await handleSimRaFile(
          file,
          this.model,
          tags,
          description
        );
        break;
      }
      // Handles CERv2 files
      case SupportedDatasetFileTypes.CERV2: {
        await handleCERV2File(
          file,
          tags,
          steps ? +steps : undefined,
          description
        );
        break;
      }
      // Unsupported dataset
      default: {
        throw new OperationNotSupportedError("Dataset not supported!");
      }
    }
    // Return created documents
    return createdDocuments;
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

  async getNestedValue(
    documentId: MongooseObjectId,
    path: string
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
    return keyValue;
  }

  async deleteNestedValue(
    documentId: MongooseObjectId,
    path: string
  ): Promise<Datafile> {
    const document = await this.model.findByIdAndUpdate(
      documentId,
      { $unset: { [parsePath(path)]: "" } },
      { new: true, upsert: true }
    );
    return document;
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
}
