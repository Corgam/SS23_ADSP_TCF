import { Mongoose } from "mongoose";

// MongoDB Schema for the Basic Data File
// This is a sample file showing how shemas work inside MongoDB

module.exports = (mongoose: Mongoose) => {
  // Specify the schema requirements
  var schema = new mongoose.Schema(
    {
      title: String,
      description: String,
    },
    {
      timestamps: true,
    }
  );
  // Create the schema inside of the db
  const BasicDataFile = mongoose.model("basic_data_file", schema);
  return BasicDataFile;
};
