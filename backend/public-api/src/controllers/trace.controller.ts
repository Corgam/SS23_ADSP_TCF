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
  Tags,
} from "tsoa";

import type {
  MongooseObjectId,
  Trace,
  TraceCreateParams,
  TraceUpdateParams,
} from "../../../../common/types";
import { NotFoundError } from "../errors";
import TraceService from "../services/trace/trace.service";

/**
 * TraceController
 *
 * Controller class for handling Traces related endpoints.
 */
@Route("traces")
@Tags("Trace")
export class TraceController extends Controller {
  private readonly traceService = new TraceService();

  /**
   * Retrieves the list of existing traces.
   *
   * @returns A promise that resolves to an array of Traces objects.
   */
  @Get()
  @SuccessResponse(200, "Sent all traces.")
  public async getAllTraces(): Promise<Trace[]> {
    this.setStatus(200);
    return this.traceService.getAll();
  }

  /**
   * Retrieves the details of an existing Trace document.
   *
   * @param traceId - The unique identifier of the Trace document.
   * @returns A promise that resolves to the Trace object.
   * @throws NotFoundError if the document is not found.
   */
  @Get("{traceId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Trace found.")
  public async getTrace(@Path() traceId: MongooseObjectId): Promise<Trace> {
    this.setStatus(200);
    return this.traceService.get(traceId);
  }

  /**
   * Creates a Trace document.
   *
   * @param body - The data for creating the document.
   * @returns A promise that resolves to the created entity.
   */
  @SuccessResponse(200, "Created successfully.")
  @Post()
  public async createTrace(@Body() body: TraceCreateParams): Promise<Trace> {
    this.setStatus(200);
    return this.traceService.create(body);
  }

  /**
   * Deletes a trace document.
   *
   * @param traceId - The unique identifier of the document to delete.
   * @returns A promise that resolves to the deleted entity.
   * @throws NotFoundError if the document is not found.
   */
  @Delete("{traceId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Deleted successfully.")
  public async deleteTrace(@Path() traceId: MongooseObjectId): Promise<Trace> {
    this.setStatus(200);
    return this.traceService.delete(traceId);
  }

  /**
   * Updates a document.
   *
   * @param traceId - The unique identifier of the document to update.
   * @param body - The data for updating the document.
   * @returns A promise that resolves to the updated entity.
   * @throws NotFoundError if the document is not found.
   */
  @Put("{traceId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Updated successfully.")
  public async updateTrace(
    @Path() traceId: MongooseObjectId,
    @Body() body: TraceUpdateParams
  ): Promise<Trace> {
    this.setStatus(200);
    return this.traceService.update(traceId, body);
  }
}
