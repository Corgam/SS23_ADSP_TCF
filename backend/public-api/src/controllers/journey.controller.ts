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
  Security,
} from "tsoa";

import type {
  FilterSetParams,
  MongooseObjectId,
  Journey,
  JourneyCreateParams,
  JourneyUpdateParams,
  PaginationResult,
  DeleteManyParam,
} from "../../../../common/types";
import { NotFoundError, OperationNotSupportedError } from "../errors";
import JourneyService from "../services/journey/journey.service";

/**
 * JourneyController
 *
 * Controller class for handling Journey related endpoints.
 */
@Route("journey")
@Tags("Journey")
@Security("firebase")
export class JourneyController extends Controller {
  private readonly journeyService = new JourneyService();

  /**
   * Retrieves the list of existing Journeys.
   * @param skip Pagination, number of documents to skip (no. of page)
   * @param limit Pagination, number of documents to return (page size)
   * @returns A promise that resolves to an array of Journeys objects.
   */
  @Get("limit={limit}&skip={skip}")
  @SuccessResponse(200, "Sent all journeys.")
  public async getAllJourneys(
    @Path() skip: number,
    @Path() limit: number
  ): Promise<PaginationResult<Journey>> {
    this.setStatus(200);
    return this.journeyService.getAll(skip, limit);
  }

  /**
   * Retrieves the details of an existing Journey document.
   *
   * @param journeyId - The unique identifier of the Journey document.
   * @returns A promise that resolves to the Journey object.
   * @throws NotFoundError if the document is not found.
   */
  @Get("{journeyId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Journey found.")
  public async getJourney(
    @Path() journeyId: MongooseObjectId
  ): Promise<Journey> {
    this.setStatus(200);
    return this.journeyService.get(journeyId);
  }

  /**
   * Creates a Journey document.
   *
   * @param body - The data for creating the document.
   * @returns A promise that resolves to the created entity.
   */
  @SuccessResponse(200, "Created successfully.")
  @Post()
  public async createJourney(
    @Body() body: JourneyCreateParams
  ): Promise<Journey> {
    this.setStatus(200);
    return this.journeyService.create(body);
  }

  /**
   * Deletes a Journey document.
   *
   * @param journeyId - The unique identifier of the document to delete.
   * @returns A promise that resolves to the deleted entity.
   * @throws NotFoundError if the document is not found.
   */
  @Delete("{journeyId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Deleted successfully.")
  public async deleteJourney(
    @Path() journeyId: MongooseObjectId
  ): Promise<Journey> {
    this.setStatus(200);
    return this.journeyService.delete(journeyId);
  }

  /**
   * Deletes all Journeys with ids given in a list.
   *
   * @param body - A list of journeys' IDs to delete
   * @returns A promise that resolves to a list of deleted entities.
   */
  @Post("deleteMany")
  @SuccessResponse(200, "Deleted successfully.")
  public async deleteManyDatafiles(
    @Body() body: DeleteManyParam
  ): Promise<Journey[]> {
    this.setStatus(200);
    return this.journeyService.deleteMany(body);
  }

  /**
   * Updates a document.
   *
   * @param journeyId - The unique identifier of the document to update.
   * @param body - The data for updating the document.
   * @returns A promise that resolves to the updated entity.
   * @throws NotFoundError if the document is not found.
   */
  @Put("{journeyId}")
  @Response<NotFoundError>(404, "Not found")
  @SuccessResponse(200, "Updated successfully.")
  public async updateJourney(
    @Path() journeyId: MongooseObjectId,
    @Body() body: JourneyUpdateParams
  ): Promise<Journey> {
    this.setStatus(200);
    return this.journeyService.update(journeyId, body);
  }

  /**
   * Retrieves a list of all matching documents based on the provided filters.
   *
   * @param body - A json object, containing an array of filters to use.
   * @param skip Pagination, number of documents to skip (no. of page)
   * @param limit Pagination, number of documents to return (page size)
   * @returns A promise that resolves to an array of all matching documents.
   * @throws OperationNotFoundError if the specified operation is not supported.
   */
  @Post("/filter/limit={limit}&skip={skip}")
  @SuccessResponse(200, "Sent all matching files.")
  @Response<OperationNotSupportedError>(400, "Operation not supported.")
  public async filterJourneys(
    @Path() skip: number,
    @Path() limit: number,
    @Body() body: FilterSetParams
  ): Promise<PaginationResult<Journey>> {
    this.setStatus(200);
    return this.journeyService.getFiltered(body, skip, limit);
  }
}
