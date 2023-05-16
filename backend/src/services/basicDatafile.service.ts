
import basicDatafileModel, { BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams } from "../models/basicDatafile.model";
import { BaseService } from "./base.service";

/**
 * BasicDatafileService
 *
 * Service class for managing BasicDatafile entities.
 * Extends the BaseService class with specific types for BasicDatafile CRUD operations.
 */
export default class BasicDatafileService extends BaseService<BasicDatafile, BasicDatafileCreateParams, BasicDatafileUpdateParams> { 
  /**
   * Constructs the BasicDatafileService instance.
   * Initializes the BaseService with the BasicDatafile model.
   */
  constructor() {
    super(basicDatafileModel);
  }
}