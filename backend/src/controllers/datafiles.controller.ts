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
  MongooseObjectId,
} from "../types";
import DatafileService from "../services/datafile.service";
import { NotFoundError } from "../errors";

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
  public async getAllDataFiles(): Promise<Datafile[]> {
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
  public async getDatafile(
    @Path() fileId: MongooseObjectId
  ): Promise<Datafile> {
    return this.datafileService.get(fileId);
  }

  /**
   * Creates a file.
   *
   * @param body - The data for creating the file.
   * @returns A promise that resolves to void.
   * @throws NotFoundError if the file is not found.
   */
  @SuccessResponse(201, "Created successfully.") // Custom success response
  @Post()
  public async createDatafile(
    @Body() body: DatafileCreateParams
  ): Promise<void> {
    this.setStatus(201); // set return status 201
    return this.datafileService.create(body);
  }

  /**
   * Deletes a file.
   *
   * @param fileId - The unique identifier of the file to delete.
   * @returns A promise that resolves to void.
   * @throws NotFoundError if the file is not found.
   */
  @Delete("{fileId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(201, "Deleted successfully.")
  public async deleteDatafile(@Path() fileId: MongooseObjectId): Promise<void> {
    this.setStatus(201);
    return this.datafileService.delete(fileId);
  }

  /**
   * Updates a file.
   *
   * @param fileId - The unique identifier of the file to update.
   * @param body - The data for updating the file.
   * @returns A promise that resolves to void.
   * @throws NotFoundError if the file is not found.
   */
  @Put("{fileId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(201, "Updated successfully.")
  public async updateDatafile(
    @Path() fileId: MongooseObjectId,
    @Body() body: DatafileUpdateParams
  ): Promise<void> {
    return this.datafileService.update(fileId, body);
  }
}
