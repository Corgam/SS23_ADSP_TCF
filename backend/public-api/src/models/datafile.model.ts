import { Schema, model } from "mongoose";
import {
  Datafile,
  MediaType,
  DataType,
} from "../../../../common/types/datafile";
import { SupportedDatasetFileTypes } from "../../../../common/types";

/**
 * The MongoDB Schema for the Datafile document.
 * For more info look inside Repo's Wiki.
 */
const DatafileSchema = new Schema<Datafile>(
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
    dataType: {
      type: String,
      enum: Object.values(DataType),
      required: true,
    },
    dataSet: {
      type: String,
      enum: Object.values(SupportedDatasetFileTypes),
      required: true,
    },
    uploadID: {
      type: String,
      index: true,
    },
    content: {
      data: {
        type: Object,
      },
      location: {
        coordinates: {
          type: Array<number>,
          length: 2,
          index: true,
        },
        type: {
          type: String,
        },
      },
      url: {
        type: String,
      },
      mediaType: {
        type: String,
        enum: Object.values(MediaType),
      },
    },
  },
  { timestamps: true }
);

export default model<Datafile>("Datafile", DatafileSchema, "datafiles");
