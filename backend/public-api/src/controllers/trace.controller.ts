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
  FilterSetParams,
  MongooseObjectId,
  Trace,
  TraceCreateParams,
  TraceUpdateParams,
} from "../../../../common/types";
import { NotFoundError, OperationNotSupportedError } from "../errors";
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
   * @param skip Pagination, number of documents to skip (no. page)
   * @param limit Pagination, number of documents to return (page size)
   * @returns A promise that resolves to an array of Traces objects.
   */
  @Get("limit={limit}&skip={skip}")
  @SuccessResponse(200, "Sent all traces.")
  public async getAllTraces(
    @Path() skip: number,
    @Path() limit: number
  ): Promise<Trace[]> {
    this.setStatus(200);
    return this.traceService.getAll(skip, limit);
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

  /**
   * Retrieves a list of all matching documents based on the provided filters.
   *
   * @param body - A json object, containing an array of filters to use.
   * @param skip Pagination, number of documents to skip (no. page)
   * @param limit Pagination, number of documents to return (page size)
   * @returns A promise that resolves to an array of all matching documents.
   * @throws OperationNotFoundError if the specified operation is not supported.
   */
  @Post("/filter/limit={limit}&skip={skip}")
  @SuccessResponse(200, "Sent all matching files..")
  @Response<OperationNotSupportedError>(400, "Operation not supported.")
  public async filterTraces(
    @Path() skip: number,
    @Path() limit: number,
    @Body() body: FilterSetParams
  ): Promise<Trace[]> {
    this.setStatus(200);
    return this.traceService.getFiltered(body, skip, limit);
  }
}
