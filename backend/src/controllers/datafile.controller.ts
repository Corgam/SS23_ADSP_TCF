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
} from "tsoa";

import type {
  Datafile,
  DatafileCreateParams,
  DatafileUpdateParams,
  DatafileFilteringParams,
  MongooseObjectId,
} from "../../../common/types";
import DatafileService from "../services/datafile.service";
import { NotFoundError, OperationNotFoundError } from "../errors";

/**
 * DatafileController
 *
 * Controller class for handling Datafile related endpoints.
 */
@Route("datafiles")
export class DatafileController extends Controller {
  private readonly datafileService = new DatafileService();

  /**
   * Retrieves the list of existing files.
   *
   * @returns A promise that resolves to an array of Datafile objects.
   */
  @Get()
  @SuccessResponse(200, "Sent all files.")
  public async getAllDataFiles(): Promise<Datafile[]> {
    this.setStatus(200);
    return this.datafileService.getAll();
  }

  /**
   * Retrieves the details of an existing file.
   *
   * @param fileId - The unique identifier of the file.
   * @returns A promise that resolves to the Datafile object.
   * @throws NotFoundError if the file is not found.
   */
  @Get("{fileId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Datafile found.")
  public async getDatafile(
    @Path() fileId: MongooseObjectId
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.get(fileId);
  }

  /**
   * Creates a file.
   *
   * @param body - The data for creating the file.
   * @returns A promise that resolves to the created entity.
   * @throws NotFoundError if the file is not found.
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
   * Deletes a file.
   *
   * @param fileId - The unique identifier of the file to delete.
   * @returns A promise that resolves to the deleted entity.
   * @throws NotFoundError if the file is not found.
   */
  @Delete("{fileId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Deleted successfully.")
  public async deleteDatafile(
    @Path() fileId: MongooseObjectId
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.delete(fileId);
  }

  /**
   * Updates a file.
   *
   * @param fileId - The unique identifier of the file to update.
   * @param body - The data for updating the file.
   * @returns A promise that resolves to the updated entity.
   * @throws NotFoundError if the file is not found.
   */
  @Put("{fileId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Updated successfully.")
  public async updateDatafile(
    @Path() fileId: MongooseObjectId,
    @Body() body: DatafileUpdateParams
  ): Promise<Datafile> {
    this.setStatus(200);
    return this.datafileService.update(fileId, body);
  }

  /**
   * Retrieves a list of all matching files based on the provided filters.
   *
   * @param body - A json object, containing an array of filters to use.
   * @returns A promise that resolves to an array of all matching Datafile objects.
   * @throws OperationNotFoundError if the specified operation is not supported.
   */
  @Post("/filter")
  @SuccessResponse(200, "Sent all matching files..")
  @Response<OperationNotFoundError>(400, "Operation not supported.")
  public async filterDatafiles(
    @Body() body: DatafileFilteringParams
  ): Promise<Datafile[]> {
    this.setStatus(200);
    return this.datafileService.getFiltered(body);
  }
}
