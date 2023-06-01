import { JsonObject } from "swagger-ui-express";
import {
  Datafile,
  DatafileCreateParams,
  DatafileFilteringParams,
  DatafileUpdateParams,
  FilterOperations,
} from "../../../common/types";
import DatafileModel from "../models/datafile.model";
import { BaseService } from "./base.service";
import { OperationNotFoundError } from "../errors";

/**
 * DatafileService
 *
 * Service class for managing Datafile entities.
 * Extends the BaseService class with specific types for Datafile CRUD operations.
 */
export default class DatafileService extends BaseService<
  Datafile,
  DatafileCreateParams,
  DatafileUpdateParams
> {
  /**
   * Constructs the DatafileService instance.
   * Initializes the BaseService with the Datafile model.
   */
  constructor() {
    super(DatafileModel);
  }

  /**
   * Retrieves the list of all matching files.
   *
   * @param updateParams - The parameters to update.
   * @returns A promise that resolves to an array of all matching Datafile objects.
   */
  async getFiltered(filter: DatafileFilteringParams): Promise<Datafile[]> {
    switch (filter["operation"]) {
      case FilterOperations.contains: {
        const keyString = filter["key"];
        const jsonFilter = {
          [keyString]: { $regex: filter["value"], $options: "i" },
        };
        return await this.model.find(jsonFilter);
      }
      default: {
        throw new OperationNotFoundError();
      }
    }
  }
}
