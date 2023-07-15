import { AnyFilter } from "./filterSet";
import { MongooseObjectId } from "./mongooseObjectId";

// Types of visibility of a Journey
export enum Visibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

// Interface representing a single collection
export interface Collection {
  title: string;
  filterSet: AnyFilter[];
}

// Interface representing the Journey
export interface Journey {
  title: string;
  description?: string;
  tags: Array<string>;
  author: string;
  parentID?: MongooseObjectId;
  collections: Collection[];
  visibility: Visibility;
}

// Type representing the parameters required for creating a Journey.
export type JourneyCreateParams = Pick<
  Journey,
  | "title"
  | "description"
  | "tags"
  | "author"
  | "parentID"
  | "visibility"
  | "collections"
>;

// Type representing the parameters required for updating a Journey.
export type JourneyUpdateParams = Pick<
  Journey,
  | "title"
  | "description"
  | "tags"
  | "author"
  | "parentID"
  | "visibility"
  | "collections"
>;

export interface DropdownOption  {
  value: string;
  viewValue: string;
}
