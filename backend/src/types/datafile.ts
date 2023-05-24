import { Document } from "mongoose";
import { JsonObject } from "swagger-ui-express";

// Enum for different types of datafile
export const DataType = {
  referenced: "Referenced",
  notReferenced: "NotReferenced",
} as const;

// Enum for the different types of media
export const MediaType = {
  photo: "Photo",
  video: "Video",
  sound: "Sound",
} as const;

// Content for Referenced Datafiles
export interface Ref {
  url: string;
  mediaType: keyof typeof MediaType;
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
  dataType: keyof typeof DataType;
  tags: Array<string>;
  // Content
  content: Ref | NotRef;
  // MongoDB
  createdAt: string;
  updatedAt: string;
  _id: string;
  __v: number; // Version of the file
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
