import { Schema, model } from "mongoose";
import {
  Datafile,
  MediaType,
  DataType,
  DatafileDataChunks,
} from "../../../../common/types/datafile";
import { SupportedDatasetFileTypes } from "../../../../common/types";

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
    traceId: {
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

DatafileSchema.set("toJSON", { 
  transform(doc, ret, options) {
    // if dataChunks exist
    if(ret.content.dataChunks?.length > 0) {
      // replace content.data with chunked data
      ret.content.data = ret.content.dataChunks
        .reduce((acc: string, chunk: DatafileDataChunks) => {
          acc += chunk?.data;
          return acc;
        }, "");
    }
    // remove content.dataChunks
    delete ret.content.dataChunks;
    return ret;
  },
});

export default model<Datafile>("Datafile", DatafileSchema, "datafiles");
