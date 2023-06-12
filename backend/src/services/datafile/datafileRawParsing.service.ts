import { FailedToParseError } from "../../errors";
import streamifier from "streamifier";
import csv from "csv-parse";
import { JsonObject } from "swagger-ui-express";

/**
 * Handle JSON file type for creating a new datafile
 *
 * @param file - The JSON file to create a datafile object from.
 * @returns Final Datafile object
 */
export function handleJSONFile(file: Express.Multer.File): JsonObject {
  try {
    const jsonObject = JSON.parse(file.buffer.toString());
    return jsonObject;
  } catch (error) {
    throw new FailedToParseError("Failed to parse provided JSON file.");
  }
}

/**
 * Handle CSV file type for creating a new datafile.
 * A header line is required for provided CSV files.
 *
 * @param file - The CSV file to create a datafile object from.
 * @returns Final Datafile object
 */
export function handleCSVFile(file: Express.Multer.File): JsonObject {
  const dataRows: JsonObject = [];
  // Parse the CSV file
  streamifier
    // Transform the multer file into file stream
    .createReadStream(file.buffer)
    // Parse each line into JSON object, skipping the header
    .pipe(csv.parse())
    // Append the data to the array
    .on("data", (row) => {
      dataRows.push(row);
    })
    // On end of file
    .on("end", () => {
      console.log("Ended!");
    });
  // Return the array of parsed JSON objects
  return dataRows;
}
