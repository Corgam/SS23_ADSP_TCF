import type {
  Datafile,
  DatafileCreateParams,
  DatafileUpdateParams,
} from "../types";
import DatafileModel from "../models/datafile.model";
import { BaseService } from "./base.service";

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
}
