// Interface for Pagination results
export interface PaginationResult<T> {
  skip: number;
  limit: number;
  totalCount: number;
  results: Array<T>;
}
