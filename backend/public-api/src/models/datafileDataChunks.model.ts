import { Schema, model } from "mongoose";

import DataFileModel from "./datafile.model";
import { DatafileDataChunks } from "../../../../common/types";

const DataFileDataChunks = new Schema(
  {
    ref: { type: Schema.Types.ObjectId, ref: DataFileModel, required: true },
    id: { type: String, required: true },
    data: { type: String, required: true },
  }
);

export default model<DatafileDataChunks>("datafileDataChunks", DataFileDataChunks, "datafileDataChunks");
