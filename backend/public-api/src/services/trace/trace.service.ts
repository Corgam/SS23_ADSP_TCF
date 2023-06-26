import { PipelineStage } from "mongoose";
import {
  AnyFilter,
  FilterSetParams,
  Trace,
  TraceCreateParams,
  TraceUpdateParams,
} from "../../../../../common/types";
import TraceModel from "../../models/trace.model";
import { CrudService } from "../crud.service";
import {
  createBasicFilterQuery,
  createConcatenationFilterQuery,
} from "../filter/filter.service";

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

  /**
   * Retrieves the list of all matching files.
   *
   * @param filterSetParams - Object containing an array of filters to be executed.
   * @param skip Pagination, number of documents to skip (no. page)
   * @param limit Pagination, number of documents to return (page size)
   * @returns A promise that resolves to an array of all matching Trace objects.
   */
  async getFiltered(
    filterSetParams: FilterSetParams,
    skip: number,
    limit: number
  ): Promise<Trace[]> {
    const jsonQueries: PipelineStage[] = [];
    filterSetParams.filterSet.forEach((filter: AnyFilter) => {
      if (!("booleanOperation" in filter)) {
        // Single DataFileFilter
        jsonQueries.push({ $match: createBasicFilterQuery(filter) });
      } else {
        // Boolean Concatenation DataFileFilter
        jsonQueries.push({
          $match: createConcatenationFilterQuery(filter),
        });
      }
    });
    // Pagination
    jsonQueries.push({ $skip: skip });
    jsonQueries.push({ $limit: limit });
    // Return result
    return await this.model.aggregate(jsonQueries);
  }
}
