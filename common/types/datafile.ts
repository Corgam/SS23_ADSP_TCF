// Interface taken from `swagger-ui-express` model
export interface JsonObject {
  [key: string]: any;
}

// Interface representing the Datafile in MongoDB.
export type Datafile = BaseDataFile & {
  dataType: DataType; // Type of the datafile, either referenced or not.
  content: Ref | NotRef; // JSON object, which changes based on the dataType.
};

// Interface for the basic Datafile (do not create, use `Datafile` instead)
export interface BaseDataFile {
  _id?: string; // ID given by the MongoDB
  title: string; // Title of the datafile
  description?: string; // Optional description of the datafile
  tags: Array<string>; // Array of tags
  uploadID?: string; // Upload ID (used by dataset file upload)
  dataSet: string; // Specific Dataset from which this file was created
}

// Interface for the Referenced Datafile (do not create, use `Datafile` instead)
export type RefDataFile = BaseDataFile & {
  dataType: DataType.REFERENCED;
  content: Ref;
};

// Interface for the Not Referenced Datafile (do not create, use `Datafile` instead)
export type NotRefDataFile = BaseDataFile & {
  dataType: DataType.NOTREFERENCED;
  content: NotRef;
};

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

// Type representing the parameters required for creating a Datafile.
export type DatafileCreateParams = Pick<
  Datafile,
  | "title"
  | "description"
  | "dataType"
  | "tags"
  | "dataSet"
  | "content"
  | "_id"
  | "uploadID"
>;

// Type representing the parameters required for updating a Datafile.
export type DatafileUpdateParams = Pick<
  Datafile,
  | "title"
  | "description"
  | "dataType"
  | "tags"
  | "dataSet"
  | "content"
  | "_id"
  | "uploadID"
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
