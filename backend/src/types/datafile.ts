import { Document } from "mongoose";
import { JsonObject } from "swagger-ui-express";

// Enum for different types of datafile
export enum DataType {
  referenced = "Referenced",
  notReferenced = "NotReferenced",
}

// Enum for the different types of media
export enum MediaType {
  photoFile = "PhotoFile",
  videoFile = "VideoFile",
  soundFile = "SoundFile",
}

// Content for Referenced Datafiles
export interface Ref {
  url: String;
  mediaType: MediaType;
  coords: Array<number>; // Tuples are not supported by TSOA
}

// Content for Not Referenced Datafiles
export interface NotRef {
  data: JsonObject;
  coords?: Array<number>; // Tuples are not supported by TSOA
}

// Interface representing the Datafile in MongoDB.
export interface Datafile extends Document {
  // Metadata
  title: string;
  description?: string;
  dataType: DataType;
  tags: Array<String>;
  // Content
  content: Ref | NotRef;
  // MongoDB
  createdAt: string;
  updatedAt: string;
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
