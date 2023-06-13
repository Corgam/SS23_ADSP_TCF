import { JsonObject } from "swagger-ui-express";
import streamifier from "streamifier";
import csv from "csv-parse";

/**
 * Handle files from the SimRa dataset
 *
 * @param file - The SimRa file to create a datafile object from.
 * @returns Final Datafile object
 */
export function handleSimRaFile(file: Express.Multer.File): JsonObject {
  const dataRows: JsonObject = [];
  // Parse the CSV file
  streamifier
    // Transform the multer file into file stream
    .createReadStream(file.buffer)
    // Parse each line into JSON object, skipping the header
    .pipe(csv.parse({ from_line: 7, columns: true }))
    // Append the data to the array
    .on("data", (row: JsonObject) => {
      dataRows.push(row);
    })
    // On end of file
    .on("end", () => {
      console.log("Ended!");
    });
  // Return the array of parsed JSON objects
  return dataRows;
}
