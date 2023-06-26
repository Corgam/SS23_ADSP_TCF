import { DataFileAnyFilter } from "./datafileFilterSet";
import { MongooseObjectId } from "./mongooseObjectId";

// Types of visibility of a trace
export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// Interface representing the Trace
export interface Trace {
  title: string;
  description?: string;
  tags: Array<string>;
  author: string;
  parent?: MongooseObjectId;
  visibility: Visibility;
  filterSet: DataFileAnyFilter[];
}

// Type representing the parameters required for creating a Trace.
export type TraceCreateParams = Pick<
  Trace,
  | "title"
  | "description"
  | "tags"
  | "author"
  | "parent"
  | "visibility"
  | "filterSet"
>;

// Type representing the parameters required for updating a Trace.
export type TraceUpdateParams = Pick<
  Trace,
  | "title"
  | "description"
  | "tags"
  | "author"
  | "parent"
  | "visibility"
  | "filterSet"
>;
