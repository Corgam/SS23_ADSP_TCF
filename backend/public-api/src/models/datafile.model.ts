import { Schema, model } from "mongoose";
import {
  Datafile,
  MediaType,
  DataType,
} from "../../../../common/types/datafile";
import { SupportedDatasetFileTypes } from "../../../../common/types";

// MongoDB Schema for the gridFS document
const gridFS = model("gridFS", new Schema({}, { strict: false }), "fs.files");

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
    content: {
      data: {
        dataObject: { type: Object },
      },
      dataChunks: { type: Schema.Types.ObjectId, ref: gridFS },
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

// DatafileSchema.set("toJson", {
//   transform(doc, ret, options) {
//     // if dataChunks exist
//     if(ret.content.dataChunks?.length > 0) {
//       delete ret.const.data;
//       // replace content.data with chunked data
//       ret.content.data = "";
//       for (const chunk of ret.content.dataChunks) {
//         ret.content.data += chunk.data;
//       }
//     }
//     // remove content.dataChunks
//     delete ret.content.dataChunks;
//     return ret;
//   },
// });

export default model<Datafile>("Datafile", DatafileSchema, "datafiles");
