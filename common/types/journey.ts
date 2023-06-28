import { AnyFilter } from "./filterSet";
import { MongooseObjectId } from "./mongooseObjectId";

// Types of visibility of a Journey
export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// Interface representing the Journey
export interface Journey {
  title: string;
  description?: string;
  tags: Array<string>;
  author: string;
  parent?: MongooseObjectId;
  visibility: Visibility;
  filterSet: AnyFilter[];
}

// Type representing the parameters required for creating a Journey.
export type JourneyCreateParams = Pick<
  Journey,
  | "title"
  | "description"
  | "tags"
  | "author"
  | "parent"
  | "visibility"
  | "filterSet"
>;

// Type representing the parameters required for updating a Journey.
export type JourneyUpdateParams = Pick<
  Journey,
  | "title"
  | "description"
  | "tags"
  | "author"
  | "parent"
  | "visibility"
  | "filterSet"
>;
