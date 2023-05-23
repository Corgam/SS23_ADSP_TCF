import { Schema, model } from "mongoose";
import { Datafile, MediaType, DataType } from "../types/datafile";

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
  DataType.referenced,
  new Schema({
    url: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: Object.values(MediaType),
      required: true,
    },
    coords: {
      type: [Number],
      length: 2,
      required: true,
    },
  })
);

// Schema for the Not Referenced datafile
DatafileSchema.discriminator(
  DataType.notReferenced,
  new Schema({
    data: {
      type: JSON,
      required: true,
    },
    coords: {
      type: [Number],
      length: 2,
    },
  })
);

export default model<Datafile>("Datafile", DatafileSchema, "datafiles");
