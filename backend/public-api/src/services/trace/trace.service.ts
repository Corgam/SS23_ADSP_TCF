import {
  Trace,
  TraceCreateParams,
  TraceUpdateParams,
} from "../../../../../common/types";
import TraceModel from "../../models/trace.model";
import { CrudService } from "../crud.service";

/**
 * TraceService
 *
 * Service class for managing Trace entities.
 * Extends the BaseService class with specific types for Trace CRUD operations.
 */
export default class TraceService extends CrudService<
  Trace,
  TraceCreateParams,
  TraceUpdateParams
> {
  /**
   * Constructs the DatafileService instance.
   * Initializes the BaseService with the Datafile model.
   */
  constructor() {
    super(TraceModel);
  }
}
