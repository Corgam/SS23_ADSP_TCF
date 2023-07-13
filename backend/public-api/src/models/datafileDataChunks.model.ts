import { Schema, model } from "mongoose";

import DataFileModel from "./datafile.model";

const DataFileDataChunks = new Schema(
  {
    ref: { type: Schema.Types.ObjectId, ref: DataFileModel },
    id: String,
    data: Object,
  }
);

export default model("datafileDataChunks", DataFileDataChunks, "datafileDataChunks");
