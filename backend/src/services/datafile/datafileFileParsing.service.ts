import { FailedToParseError } from "../../errors";
import { Datafile } from "../../../../common/types";
import Papa from "papaparse";
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
  let jsonObject: JsonObject = {};
  // Try to parse the CSV
  Papa.parse(file.buffer.toString(), {
    header: true,
    complete: (results) => {
      jsonObject = results.data;
    },
    error: () => {
      throw new FailedToParseError("Failed to parse provided CSV file.");
    },
  });
  return jsonObject;
}
