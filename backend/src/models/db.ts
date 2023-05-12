import mongoose, { Mongoose } from "mongoose";

const config = require("../config/config");

mongoose.Promise = global.Promise;

// Typescript interace declaration
export interface DB {
  mongoose: Mongoose;
  url: string;
  basicDataFileSchema: any;
}

// Create the db object
const db: DB = {
  mongoose: mongoose,
  url: config.url,
  basicDataFileSchema: require("./basic_datafile.model")(mongoose),
};

// Export the database object
module.exports = db;
