
import { Document } from "mongoose";

export interface BasicDatafile extends Document {
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type BasicDatafileCreateParams = Pick<BasicDatafile, "title" | "description">;
export type BasicDatafileUpdateParams = Pick<BasicDatafile, "title" | "description">;