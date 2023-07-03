import { PipelineStage } from "mongoose";
import {
  AnyFilter,
  FilterSetParams,
  Journey,
  JourneyCreateParams,
  JourneyUpdateParams,
  PaginationResult,
} from "../../../../../common/types";
import JourneyModel from "../../models/journey.model";
import { CrudService } from "../crud.service";
import {
  createBasicFilterQuery,
  createConcatenationFilterQuery,
} from "../filter/filter.service";

/**
 * JourneyService
 *
 * Service class for managing Journey entities.
 * Extends the BaseService class with specific types for Journey CRUD operations.
 */
export default class JourneyService extends CrudService<
  Journey,
  JourneyCreateParams,
  JourneyUpdateParams
> {
  /**
   * Constructs the DatafileService instance.
   * Initializes the BaseService with the Datafile model.
   */
  constructor() {
    super(JourneyModel);
  }

  /**
   * Retrieves the list of all matching files.
   *
   * @param filterSetParams - Object containing an array of filters to be executed.
   * @param skip Pagination, number of documents to skip (no. page)
   * @param limit Pagination, number of documents to return (page size)
   * @returns A PaginationResult object, containing results
   */
  async getFiltered(
    filterSetParams: FilterSetParams,
    skip: number,
    limit: number
  ): Promise<PaginationResult<Journey>> {
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
    // Get the count
    const totalCount = await this.model.aggregate(jsonQueries).exec();
    // Pagination
    jsonQueries.push({ $skip: skip });
    jsonQueries.push({ $limit: limit });
    // Get the result
    const results = await this.model.aggregate(jsonQueries).exec();
    return {
      skip: skip,
      limit: limit,
      totalCount: totalCount.length,
      results: results,
    };
  }
}
