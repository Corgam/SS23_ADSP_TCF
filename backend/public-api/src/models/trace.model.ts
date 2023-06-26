import mongoose, { Schema, model } from "mongoose";
import { Visibility } from "../../../../common/types";
import { Trace } from "../../../../common/types";

// MongoDB Schema for the Trace document
const TraceSchema = new Schema<Trace>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tags: {
      type: [String],
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    parent: mongoose.Schema.Types.ObjectId,
    visibility: {
      type: String,
      enum: Object.values(Visibility),
      required: true,
    },
    filterSet: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<Trace>("Trace", TraceSchema, "traces");
