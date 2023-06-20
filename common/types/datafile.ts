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
  title: string;
  description?: string;
  tags: Array<string>;
}

export interface ReferencedDataFile extends BaseDataFile {
  dataType: DataType.REFERENCED;
  content: Ref;
}

export interface LocalDataFile extends BaseDataFile {
  dataType: DataType.NOTREFERENCED;
  content: NotRef;
}

// Interface representing the Datafile in MongoDB.
export type Datafile = ReferencedDataFile | LocalDataFile;

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
