// MongoDB Schema for the Basic Data File
// This is a sample file showing how shemas work inside MongoDB

import { Schema, model, Document } from 'mongoose';

export interface BasicDatafile extends Document {
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export type BasicDatafileCreateParams = Pick<BasicDatafile, "title" | "description">;
export type BasicDatafileUpdateParams = Pick<BasicDatafile, "title" | "description">;

const BasicDatafileSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default model<BasicDatafile>('basic_data_file', BasicDatafileSchema);
