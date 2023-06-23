import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Response,
  SuccessResponse,
  UploadedFile,
  FormField,
  Security,
  Tags,
} from "tsoa";

import type {
  Datafile,
  DatafileCreateParams,
  DatafileUpdateParams,
  DatafileFilterSetParams,
  MongooseObjectId,
  SupportedRawFileTypes,
  SupportedDatasetFileTypes,
} from "../../../../common/types";
import DatafileService from "../services/datafile/datafile.service";
import {
  FailedToParseError,
  NotFoundError,
  OperationNotSupportedError,
  WrongObjectTypeError,
  UnauthorizedError,
} from "../errors";

/**
 * DatafileController
 *
 * Controller class for handling Datafile related endpoints.
 */
@Route("datafiles")
@Tags("Datafiles")
export class DatafileController extends Controller {
  private readonly datafileService = new DatafileService();

  /**
   * Retrieves the list of existing documents.
   *
   * @returns A promise that resolves to an array of Datafile objects.
   */
  @Get()
  @SuccessResponse(200, "Sent all documents.")
  public async getAllDataFiles(): Promise<Datafile[]> {
    this.setStatus(200);
    return this.datafileService.getAll();
  }

  /**
   * Retrieves the details of an existing document.
   *
   * @param documentId - The unique identifier of the document.
   * @returns A promise that resolves to the Datafile object.
   * @throws NotFoundError if the document is not found.
   */
  @Get("{documentId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Datafile found.")
  public async getDatafile(
    @Path() documentId: MongooseObjectId
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.get(documentId);
  }

  /**
   * Creates a document.
   *
   * @param body - The data for creating the document.
   * @returns A promise that resolves to the created entity.
   */
  @SuccessResponse(200, "Created successfully.") // Custom success response
  @Post()
  public async createDatafile(
    @Body() body: DatafileCreateParams
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.create(body);
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
  @SuccessResponse(200, "Appended file successfully.")
  @Response<NotFoundError>(404, "Not found")
  @Response<OperationNotSupportedError>(400, "File type not supported.")
  @Response<FailedToParseError>(400, "Parsing failed.")
  @Response<WrongObjectTypeError>(400, "Document is not NOTREFERENCED type.")
  @Post("/{documentID}/attach")
  public async createDatafileFromFile(
    @UploadedFile() file: Express.Multer.File,
    @Path() documentID: MongooseObjectId,
    @FormField() fileType: SupportedRawFileTypes
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.attachFile(file, documentID, fileType);
  }

  /**
   * Creates all datafiles from the uploaded dataset file
   *
   * @param file - The file to append.
   * @param dataset - Type of the dataset provided.
   * @returns A promise that resolves to all created entities.
   * @throws OperationNotSupportedError if the dataset type is not supported.
   */
  @SuccessResponse(200, "Appended file successfully.")
  @Response<OperationNotSupportedError>(400, "Dataset not supported.")
  @Post("/fromFile")
  public async createDatafileFromDataset(
    @UploadedFile() file: Express.Multer.File,
    @FormField() dataset: SupportedDatasetFileTypes
  ): Promise<Datafile[]> {
    this.setStatus(200);
    return this.datafileService.createFromFile(file, dataset);
  }

  /**
   * Deletes a document.
   *
   * @param documentId - The unique identifier of the document to delete.
   * @returns A promise that resolves to the deleted entity.
   * @throws NotFoundError if the document is not found.
   */
  @Delete("{documentId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Deleted successfully.")
  public async deleteDatafile(
    @Path() documentId: MongooseObjectId
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.delete(documentId);
  }

  /**
   * Updates a document.
   *
   * @param documentId - The unique identifier of the document to update.
   * @param body - The data for updating the document.
   * @returns A promise that resolves to the updated entity.
   * @throws NotFoundError if the document is not found.
   */
  @Put("{documentId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Updated successfully.")
  public async updateDatafile(
    @Path() documentId: MongooseObjectId,
    @Body() body: DatafileUpdateParams
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.update(documentId, body);
  }

  /**
   * Retrieves a list of all matching documents based on the provided filters.
   *
   * @param body - A json object, containing an array of filters to use.
   * @returns A promise that resolves to an array of all matching documents.
   * @throws OperationNotFoundError if the specified operation is not supported.
   */
  @Post("/filter")
  @SuccessResponse(200, "Sent all matching files..")
  @Response<OperationNotSupportedError>(400, "Operation not supported.")
  public async filterDatafiles(
    @Body() body: DatafileFilterSetParams
  ): Promise<Datafile[]> {
    this.setStatus(200);
    return this.datafileService.getFiltered(body);
  }

  /**
   * Deletes a file.
   *
   * @param fileId - The unique identifier of the file to delete.
   * @returns A promise that resolves to the deleted entity.
   * @throws NotFoundError if the file is not found.
   */
  @Delete("secure/{fileId}")
  @Response<UnauthorizedError>(
    401,
    "Access denied. Please provide valid credentials."
  )
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Deleted successfully.")
  @Security("firebase")
  @Tags("Security")
  public async deleteDatafileWithAuth(
    @Path() fileId: MongooseObjectId
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.delete(fileId);
  }
}
