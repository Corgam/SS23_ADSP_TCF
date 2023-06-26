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

// Interface representing the Datafile in MongoDB.
export interface Datafile {
  // Metadata
  title: string;
  description?: string;
  dataType: DataType;
  tags: Array<string>;
  dataSet: string;
  // Content
  content: Ref | NotRef;
}

// Type representing the parameters required for creating a Datafile.
export type DatafileCreateParams = Pick<
  Datafile,
  "title" | "description" | "dataType" | "tags" | "content"
>;

// Type representing the parameters required for updating a Datafile.
export type DatafileUpdateParams = Pick<
  Datafile,
  "title" | "description" | "dataType" | "tags" | "content"
>;
