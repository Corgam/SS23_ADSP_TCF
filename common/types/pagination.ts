// Interface for Pagination results
export interface PaginationResult {
  skip: number;
  limit: number;
  totalCount: number;
  results: Array<any>;
}
