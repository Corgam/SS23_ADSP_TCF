import { Schema, model } from "mongoose";
import { Datafile, MediaType, DataType } from "../../../common/types/datafile";

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
  },
  { timestamps: true, discriminatorKey: "dataType" }
);

// Schema for the Referenced datafile
DatafileSchema.discriminator(
  DataType.REFERENCED,
  new Schema({
    content: {
      url: {
        type: String,
        required: true,
      },
      mediaType: {
        type: String,
        enum: Object.values(MediaType),
        required: true,
      },
      location: {
        coordinates: {
          type: Array<number>,
          length: 2,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
      },
    },
  })
);

// Schema for the Not Referenced datafile
DatafileSchema.discriminator(
  DataType.NOTREFERENCED,
  new Schema({
    content: {
      data: {
        type: JSON,
        required: true,
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
    },
  })
);

export default model<Datafile>("Datafile", DatafileSchema, "datafiles");
