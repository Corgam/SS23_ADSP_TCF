// MongoDB Schema for the Basic Data File
// This is a sample file showing how shemas work inside MongoDB

import { Schema, model } from 'mongoose';
import { BasicDatafile } from '../interfaces/entities/basic_datafile.entity';

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
