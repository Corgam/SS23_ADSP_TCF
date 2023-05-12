import mongoose, { Mongoose } from "mongoose";

const config = require("../config/config");

mongoose.Promise = global.Promise;

// Typescript interace declaration
export interface DB {
  mongoose: Mongoose;
  url: string;
  datafiles: any; // TO-DO Change type
}

// Create the db object
const db: DB = {
  mongoose: mongoose,
  url: config.url,
  datafiles: require("./datafiles.model"),
};

// Export the database object
module.exports = db;
