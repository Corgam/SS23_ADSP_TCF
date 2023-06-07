import { FailedToParseError } from "../../errors";
import { Datafile } from "../../../../common/types";

/**
 * Handle JSON file type for creating a new datafile
 *
 * @param file - The JSON file to create a datafile object from.
 * @returns Final Datafile object
 */
export function handleJSONFile(file: Express.Multer.File): Datafile {
  try {
    const jsonObject = JSON.parse(file.buffer.toString());
    return jsonObject;
  } catch (error) {
    throw new FailedToParseError("Failed to parse provided JSON file.");
  }
}

/**
 * Handle CSV file type for creating a new datafile
 *
 * @param file - The CSV file to create a datafile object from.
 * @returns Final Datafile object
 */
export function handleCSVFile(file: Express.Multer.File): Datafile {
  throw new FailedToParseError("Failed to parse provided CSV file.");
}
