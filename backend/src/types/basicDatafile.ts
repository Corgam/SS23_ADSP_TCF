import { Document } from "mongoose";

// Interface representing the Basic Data File in MongoDB.
export interface BasicDatafile extends Document {
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

// Type representing the parameters required for creating a BasicDatafile.
export type BasicDatafileCreateParams = Pick<BasicDatafile, "title" | "description">;

// Type representing the parameters required for updating a BasicDatafile.
export type BasicDatafileUpdateParams = Pick<BasicDatafile, "title" | "description">;