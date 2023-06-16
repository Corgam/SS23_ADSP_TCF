import { Schema, model } from "mongoose";
import { Datafile, MediaType, DataType } from "../../../../common/types/datafile";

// MongoDB Parent Schema for the Datafile
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
    content: {
      data: {
        type: Object,
      },
      location: {
        coordinates: {
          type: Array<number>,
          length: 2,
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
