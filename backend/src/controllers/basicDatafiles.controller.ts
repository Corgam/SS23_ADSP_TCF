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

import type { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams, MongooseObjectId } from "../types";
import BasicDatafileService from "../services/basicDatafile.service";
import { NotFoundError } from "../errors";

/**
 * BasicDatafileController
 *
 * Controller class for handling BasicDatafile related endpoints.
 */
@Route("datafiles")
export class BasicDatafileController extends Controller {
  private readonly basicDatafileService = new BasicDatafileService();

  /**
   * Retrieves the list of existing files.
   *
   * @returns A promise that resolves to an array of BasicDatafile objects.
   */
  @Get()
  public async getAllDataFiles(): Promise<BasicDatafile[]> {
    return this.basicDatafileService.getAll();
  }

  /**
   * Retrieves the details of an existing file.
   *
   * @param fileId - The unique identifier of the file.
   * @returns A promise that resolves to the BasicDatafile object.
   * @throws NotFoundError if the file is not found.
   */
  @Get("{fileId}")
  @Response<NotFoundError>(404, "Not found")
  public async getDatafile(
    @Path() fileId: MongooseObjectId,
  ): Promise<BasicDatafile> {
    return this.basicDatafileService.get(fileId);
  }

  /**
   * Creates a file.
   *
   * @param body - The data for creating the file.
   * @returns A promise that resolves to void.
   * @throws NotFoundError if the file is not found.
   */
  @SuccessResponse("201", "Created") // Custom success response
  @Post()
  public async createDatafile(
    @Body() body: BasicDatafileCreateParams
  ): Promise<void> {
    this.setStatus(201); // set return status 201
    return this.basicDatafileService.create(body);
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
  public async deleteDatafile(
    @Path() fileId: MongooseObjectId,
  ): Promise<void> {
    this.basicDatafileService.delete(fileId);
    return;
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
  public async updateDatafile(
    @Path() fileId: MongooseObjectId,
    @Body() body: BasicDatafileUpdateParams,
  ): Promise<void> {
    this.basicDatafileService.update(fileId, body);
    return;
  }
}