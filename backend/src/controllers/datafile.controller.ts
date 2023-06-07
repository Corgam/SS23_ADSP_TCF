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
} from "tsoa";

import type {
  Datafile,
  DatafileCreateParams,
  DatafileUpdateParams,
  DatafileFilterSetParams,
  MongooseObjectId,
  SupportedFileTypes,
} from "../../../common/types";
import DatafileService from "../services/datafile/datafile.service";
import { NotFoundError, OperationNotSupportedError } from "../errors";

/**
 * DatafileController
 *
 * Controller class for handling Datafile related endpoints.
 */
@Route("datafiles")
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
  @SuccessResponse(201, "Created successfully.") // Custom success response
  @Post()
  public async createDatafile(
    @Body() body: DatafileCreateParams
  ): Promise<Datafile> {
    this.setStatus(201); // set return status 201
    return this.datafileService.create(body);
  }

  /**
   * Creates a document from an uploaded file.
   *
   * @param file - The file used for creating the document.
   * @param fileType - Type of the uploaded file.
   * @returns A promise that resolves to the created entity.
   * @throws OperationNotSupportedError if the file type is not supported.
   */
  @SuccessResponse(201, "Created successfully.")
  @Post("/uploadFile")
  public async createDatafileFromFile(
    @UploadedFile() file: Express.Multer.File,
    @FormField() fileType: SupportedFileTypes
  ): Promise<Datafile> {
    this.setStatus(201); // set return status 201
    return this.datafileService.createFromFile(file, fileType);
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
}
