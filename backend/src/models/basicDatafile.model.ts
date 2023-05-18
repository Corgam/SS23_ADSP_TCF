import { Schema, model } from "mongoose";
import type { BasicDatafile } from "../types/basicDatafile";

// MongoDB Schema for the Basic Data File
// This is a sample file showing how shemas work inside MongoDB
const BasicDatafileSchema = new Schema<BasicDatafile>(
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

export default model<BasicDatafile>("basic_data_file", BasicDatafileSchema);
