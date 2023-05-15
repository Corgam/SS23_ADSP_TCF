import mongoose, { Mongoose } from "mongoose";
import config from "../config/config";
import createBasicFileSchema from "./basic_datafile.model";

mongoose.Promise = global.Promise;

// Typescript interface declaration
export interface DB {
  mongoose: Mongoose;
  url: string;
  basicDataFileSchema: any;
}

// Create the db object
const db: DB = {
  mongoose: mongoose,
  url: config.MONGODB_URL,
  basicDataFileSchema: createBasicFileSchema(mongoose),
} as const;

// Export the database object
export default db;
