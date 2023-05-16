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

import type { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../models/basicDatafile.model";
import BasicDatafileService from "../services/basicDatafile.service";
import NotFoundError from "../errors/notFound.error";
import { MongooseObjectId } from "../types/mongooseObjectId";

@Route("datafiles")
export class BasicDatafileController extends Controller {
  private readonly basicDatafileService = new BasicDatafileService();

  /**
   * Retrieves the list of an existing files.
   */
  @Get()
  public async getAllDataFiles(): Promise<BasicDatafile[]> {
    return this.basicDatafileService.getAll();
  }

  /**
   * Retrieves the details of an existing file.
   * Supply the unique file ID and receive corresponding file details.
   * @param fileId The file's identifier 
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
   * Update a file.
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