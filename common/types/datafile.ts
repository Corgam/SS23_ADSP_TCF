// Interface taken from `swagger-ui-express` model
export interface JsonObject {
  [key: string]: any;
}

// Enum for different types of datafile
export enum DataType {
  REFERENCED = "REFERENCED",
  NOTREFERENCED = "NOTREFERENCED",
}

// Enum for the different types of media
export enum MediaType {
  PHOTO = "PHOTO",
  VIDEO = "VIDEO",
  SOUNDFILE = "SOUNDFILE",
}

// Coordinates
export interface Location {
  type: "Point";
  coordinates: number[];
}

// Content for Referenced Datafiles
export interface Ref {
  url: string;
  mediaType: MediaType;
  location: Location;
}

// Content for Not Referenced Datafiles
export interface NotRef {
  data: JsonObject;
  location?: Location;
}

export interface BaseDataFile {
  // Metadata
  _id?: string;
  title: string;
  description?: string;
  tags: Array<string>;
  dataSet: string;
  traceId?: string;
}

export type RefDataFile = BaseDataFile & {
  dataType: DataType.REFERENCED;
  content: Ref;
};

export type NotRefDataFile = BaseDataFile & {
  dataType: DataType.NOTREFERENCED;
  content: NotRef;
};

// Interface representing the Datafile in MongoDB.
export type Datafile = BaseDataFile & {
  dataType: DataType;
  content: Ref | NotRef;
};

// Type representing the parameters required for creating a Datafile.
export type DatafileCreateParams = Pick<
  Datafile,
  "title" | "description" | "dataType" | "tags" | "dataSet" | "content"
>;

// Type representing the parameters required for updating a Datafile.
export type DatafileUpdateParams = Pick<
  Datafile,
  "title" | "description" | "dataType" | "tags" | "dataSet" | "content"
>;

// Interface representing an object for updating nested values
export interface NestedValueUpdateParams extends NestedValueDeleteParams {
  // New value
  value: unknown;
}

// Interface representing an object for deleting nested values
export interface NestedValueDeleteParams {
  // The IDs of all documents which will be changed, comma separated.
  IDs: string;
  // Path of the variable to change
  path: string;
}
