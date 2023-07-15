import streamifier from "streamifier";
import csv from "csv-parse";
import { JsonObject } from "swagger-ui-express";
import axios from "axios";

import config from "../../config/config";
import { FailedToParseError } from "../../errors";

/**
 * Handle JSON file for attaching its data to datafile
 *
 * @param file The JSON file with data to attach.
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
 * Handle CSV file type for attaching its data to datafile
 * A header line is required for provided CSV files.
 *
 * @param file The CSV file with data to attach.
 * @returns Final Datafile object
 */
export function handleCSVFile(file: Express.Multer.File): JsonObject {
  const dataRows: JsonObject = [];
  // Parse the CSV file
  streamifier
    // Transform the multer file into file stream
    .createReadStream(file.buffer)
    // Parse each line into JSON object, skipping the header
    .pipe(csv.parse({ columns: true }))
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

/**
 * Handle TXT file type for attaching its data to datafile
 *
 * @param file The TXT file with data to attach.
 * @returns Final Datafile object.
 */
export function handleTXTFile(file: Express.Multer.File): JsonObject {
  try {
    const jsonObject = { text: file.buffer.toString() };
    return jsonObject;
  } catch (error) {
    throw new FailedToParseError("Failed to parse provided TXT file.");
  }
}

/**
 * Handles NetCDF file data by converting it to JSON format.
 * @param file - The uploaded NetCDF file.
 * @param url_extension - The extension to be appended to the URL for the conversion endpoint.
 * @returns A Promise that resolves to the parsed JSON data from the converted NetCDF file.
 * @throws FailedToParseError if there is an error during the conversion or parsing process.
 */
export async function handleNetCDFFileData(
  file: Express.Multer.File,
  url_extension: string
): Promise<any> {
  try {
    const url = config.DATASCIENCE_URL + "/convert-netcdf-to-json" + url_extension;

    // Create form data
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("file", blob, file.originalname);

    // Post form data and receive response stream
    const response = await axios.post(url, formData, {
      responseType: "stream",
    });

    // Handle response stream
    const chunks: string[] = [];
    for await (const chunk of response.data) {
      chunks.push(chunk);
    }

    return JSON.parse(chunks.join(""));
  } catch (error) {
    throw new FailedToParseError("Failed to parse the provided NetCDF file.");
  }
}

