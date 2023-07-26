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
  _id?: string; // The ID given by the MongoDB
  title: string; // The title of the Journey
  description?: string; // [Optional] The description of the Journey
  tags: string[]; // Tags of the Journey
  author: string; // The author of the Journey
  parentID?: MongooseObjectId; // The ID of the Journey from which it was created
  collections: Collection[]; // An array of collections
  visibility: Visibility; // Visibility of the Journey: PUBLIC or PRIVATE
  excludedIDs: MongooseObjectId[]; // The IDs of the "unchecked" datapoints
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
  | "excludedIDs"
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
  | "excludedIDs"
>;
